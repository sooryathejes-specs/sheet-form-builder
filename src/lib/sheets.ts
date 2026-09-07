import { google } from 'googleapis';

import { FormMetadata, FormSubmission } from '@/types';

const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

let sheetsClientInstance: any = null;

function getResponsesSheetName(name: string): string {
  // Remove characters invalid in Google Sheets sheet names: \ / ? * : [ ]
  let sanitized = name.replace(/[\\/\?\*:\[\]]/g, '');
  
  // Remove leading/trailing single quotes
  sanitized = sanitized.trim().replace(/^'|'$/g, '');
  
  // Truncate to maximum of 31 characters
  sanitized = sanitized.substring(0, 31).trim();
  
  // Fallback if empty
  if (!sanitized) {
    sanitized = 'Form Responses';
  }
  
  return sanitized;
}

async function getSheetsClient() {
  if (sheetsClientInstance) return sheetsClientInstance;

  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    throw new Error('Google Sheets API environment variables are missing.');
  }

  // Format the private key correctly (handling both escaped \n and real newlines)
  const formattedPrivateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_CLIENT_EMAIL,
      private_key: formattedPrivateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClientInstance = google.sheets({ version: 'v4', auth });
  return sheetsClientInstance;
}

async function initSpreadsheet(sheets: any) {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEET_ID,
    });
    const sheetNames = response.data.sheets?.map((s: any) => s.properties?.title) || [];

    if (!sheetNames.includes('_metadata')) {
      // 1. Add _metadata sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: '_metadata' },
              },
            },
          ],
        },
      });

      // 2. Set headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: '_metadata!A1:F1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['id', 'name', 'slug', 'description', 'fields_json', 'created_at']],
        },
      });
    }
  } catch (error) {
    console.error('Error initializing spreadsheet:', error);
    throw new Error('Failed to connect to Google Sheet. Check permissions and Spreadsheet ID.');
  }
}

export async function getForms(): Promise<FormMetadata[]> {
  const sheets = await getSheetsClient();
  await initSpreadsheet(sheets);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: '_metadata!A2:F',
  });

  const rows = response.data.values || [];
  return rows
    .filter((row: any) => row[0]) // Filter out empty/cleared rows
    .map((row: any) => {
      let fields = [];
      try {
        fields = JSON.parse(row[4] || '[]');
      } catch (e) {
        console.error('Failed to parse fields_json:', row[4]);
      }
      return {
        id: row[0],
        name: row[1],
        slug: row[2],
        description: row[3] || '',
        fields,
        createdAt: row[5] || new Date().toISOString(),
      };
    });
}

export async function getFormBySlug(slug: string): Promise<FormMetadata | null> {
  const forms = await getForms();
  return forms.find(f => f.slug === slug) || null;
}

export async function getFormById(id: string): Promise<FormMetadata | null> {
  const forms = await getForms();
  return forms.find(f => f.id === id) || null;
}

export async function createForm(form: Omit<FormMetadata, 'createdAt'>) {
  const sheets = await getSheetsClient();
  await initSpreadsheet(sheets);

  const createdAt = new Date().toISOString();

  // 1. Append metadata
  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: '_metadata!A:F',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[form.id, form.name, form.slug, form.description || '', JSON.stringify(form.fields), createdAt]],
    },
  });

  // 2. Add dynamic responses sheet
  const responsesSheetName = getResponsesSheetName(form.name);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: GOOGLE_SHEET_ID,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: { title: responsesSheetName },
          },
        },
      ],
    },
  });

  // 3. Set headers in the new sheet
  const headers = ['submission_id', 'submitted_at', ...form.fields.map(f => f.label)];
  await sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${responsesSheetName}!A1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [headers],
    },
  });
}

export async function updateForm(id: string, updatedForm: Partial<FormMetadata>) {
  const sheets = await getSheetsClient();
  await initSpreadsheet(sheets);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: '_metadata!A:F',
  });
  const rows = response.data.values || [];
  const rowIndex = rows.findIndex((row: any) => row[0] === id);
  if (rowIndex === -1) {
    throw new Error('Form not found in metadata');
  }

  // Row number is rowIndex + 1 (since response is 0-indexed but has header row, row index 0 is first row data, sheet row 2)
  // Wait, let's verify.
  // If `A:F` is read, rowIndex 0 is A1 (the header).
  // So rowIndex + 1 is the actual sheet row number! Yes, because rowIndex is 0-based.
  const sheetRow = rowIndex + 1;
  const existingRow = rows[rowIndex];

  const name = updatedForm.name ?? existingRow[1];
  const slug = updatedForm.slug ?? existingRow[2];
  const description = updatedForm.description ?? existingRow[3];
  const fields = updatedForm.fields ? JSON.stringify(updatedForm.fields) : existingRow[4];
  const createdAt = existingRow[5];

  await sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `_metadata!A${sheetRow}:F${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[id, name, slug, description, fields, createdAt]],
    },
  });

  const oldName = existingRow[1];
  const newName = name;
  const oldSheetName = getResponsesSheetName(oldName);
  const newSheetName = getResponsesSheetName(newName);

  if (oldSheetName !== newSheetName) {
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_SHEET_ID,
      });
      const targetSheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === oldSheetName);
      if (targetSheet && targetSheet.properties?.sheetId !== undefined) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: GOOGLE_SHEET_ID,
          requestBody: {
            requests: [
              {
                updateSheetProperties: {
                  properties: {
                    sheetId: targetSheet.properties.sheetId,
                    title: newSheetName,
                  },
                  fields: 'title',
                },
              },
            ],
          },
        });
      }
    } catch (e) {
      console.error(`Failed to rename sheet from ${oldSheetName} to ${newSheetName}:`, e);
    }
  }

  // Synchronize headers of the responses sheet if fields are updated
  if (updatedForm.fields) {
    const responsesSheetName = newSheetName;
    let existingHeaders: string[] = [];
    try {
      const headersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `${responsesSheetName}!1:1`,
      });
      existingHeaders = headersResponse.data.values?.[0] || [];
    } catch (e) {
      console.warn(`Could not read headers for sheet ${responsesSheetName}, creating headers from scratch`, e);
      existingHeaders = ['submission_id', 'submitted_at'];
    }

    // Append new field labels to the end of the existing headers list to prevent shifting existing response columns
    const newHeaders = [...existingHeaders];
    for (const field of updatedForm.fields) {
      if (!newHeaders.includes(field.label)) {
        newHeaders.push(field.label);
      }
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${responsesSheetName}!1:1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [newHeaders],
      },
    });
  }
}

export async function deleteForm(id: string) {
  const sheets = await getSheetsClient();
  await initSpreadsheet(sheets);

  // 1. Clear metadata row
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: '_metadata!A:F',
  });
  const rows = response.data.values || [];
  const rowIndex = rows.findIndex((row: any) => row[0] === id);
  const formName = rowIndex !== -1 ? rows[rowIndex][1] : '';

  if (rowIndex !== -1) {
    const sheetRow = rowIndex + 1;
    // We clear instead of deleting rows to avoid index shift issues, or we can replace it with empty cells.
    // For a cleaner Google Sheets layout, let's delete the row.
    // To delete a row in Google Sheets, we use the deleteDimension request.
    // Let's use deleteDimension for clean deletion so the sheet doesn't accumulate blank rows!
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEET_ID,
    });
    const metadataSheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === '_metadata');
    if (metadataSheet && metadataSheet.properties?.sheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEET_ID,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: metadataSheet.properties.sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex, // 0-indexed inclusive (rowIndex matches the 0-indexed row number)
                  endIndex: rowIndex + 1, // 0-indexed exclusive
                },
              },
            },
          ],
        },
      });
    } else {
      // Fallback to clear
      await sheets.spreadsheets.values.clear({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `_metadata!A${sheetRow}:F${sheetRow}`,
      });
    }
  }

  // 2. Find and delete dynamic responses sheet
  if (formName) {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEET_ID,
    });
    const responsesSheetName = getResponsesSheetName(formName);
    const targetSheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === responsesSheetName);
    if (targetSheet && targetSheet.properties?.sheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEET_ID,
        requestBody: {
          requests: [
            {
              deleteSheet: {
                sheetId: targetSheet.properties.sheetId,
              },
            },
          ],
        },
      });
    }
  }
}

export async function submitResponse(formId: string, answers: Record<string, any>) {
  const sheets = await getSheetsClient();
  const form = await getFormById(formId);
  const responsesSheetName = form ? getResponsesSheetName(form.name) : `responses_${formId}`;

  // 1. Get headers to know field placement
  let headers = ['submission_id', 'submitted_at'];
  try {
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${responsesSheetName}!1:1`,
    });
    headers = headerResponse.data.values?.[0] || ['submission_id', 'submitted_at'];
  } catch (error) {
    console.error(`Responses sheet not found for form ${formId}. Creating it now...`);
    // Attempt to recreate responses sheet if missing
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: GOOGLE_SHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: responsesSheetName },
            },
          },
        ],
      },
    });
    headers = ['submission_id', 'submitted_at', ...(form?.fields.map(f => f.label) || [])];
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${responsesSheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });
  }

  // 2. Create submission row matching headers
  const submissionId = Math.random().toString(36).substring(2, 11).toUpperCase();
  const submittedAt = new Date().toISOString();

  // Retrieve form fields to map field labels to IDs
  const fields = form?.fields || [];

  const row = headers.map(header => {
    if (header === 'submission_id') return submissionId;
    if (header === 'submitted_at') return submittedAt;

    // Find the field with this label
    const field = fields.find(f => f.label === header);
    if (!field) return '';

    const val = answers[field.id];
    if (val === undefined || val === null) return '';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
  });

  // 3. Append the response row
  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${responsesSheetName}!A:A`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [row],
    },
  });

  return { id: submissionId, submittedAt };
}

export async function getResponses(formId: string): Promise<FormSubmission[]> {
  const sheets = await getSheetsClient();
  const form = await getFormById(formId);
  const responsesSheetName = form ? getResponsesSheetName(form.name) : `responses_${formId}`;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${responsesSheetName}!A:ZZ`,
    });
    const rows = response.data.values || [];
    if (rows.length <= 1) return [];

    const headers: string[] = rows[0] || [];
    const dataRows = rows.slice(1);

    // Retrieve form fields to map labels back to IDs
    const fields = form?.fields || [];

    return dataRows.map((row: any, rowIndex: number) => {
      const answers: Record<string, any> = {};
      let submissionId = `row_${rowIndex}`;
      let submittedAt = '';

      headers.forEach((header, index) => {
        const val = row[index] || '';
        if (header === 'submission_id') {
          submissionId = val;
        } else if (header === 'submitted_at') {
          submittedAt = val;
        } else {
          // Find field ID matching this header label
          const field = fields.find(f => f.label === header);
          const key = field ? field.id : header;
          answers[key] = val;
        }
      });

      return {
        id: submissionId,
        formId,
        submittedAt,
        answers,
      };
    });
  } catch (error) {
    console.error(`Error reading responses for form ${formId}:`, error);
    return [];
  }
}
