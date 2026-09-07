import { NextRequest, NextResponse } from 'next/server';
import { getForms, createForm } from '@/lib/sheets';
import { FormMetadata } from '@/types';

export async function GET() {
  try {
    const forms = await getForms();
    return NextResponse.json(forms);
  } catch (error: any) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, fields } = body;

    if (!name || !slug || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: 'Missing required parameters: name, slug, and fields' }, { status: 400 });
    }

    // Format slug (replace spaces with hyphens, lowercase)
    const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    // Check if slug is already used
    const existingForms = await getForms();
    if (existingForms.some(f => f.slug === formattedSlug)) {
      return NextResponse.json({ error: 'A form with this slug already exists' }, { status: 400 });
    }

    const formId = Math.random().toString(36).substring(2, 10).toUpperCase();

    const newForm: Omit<FormMetadata, 'createdAt'> = {
      id: formId,
      name,
      slug: formattedSlug,
      description: description || '',
      fields,
    };

    await createForm(newForm);

    return NextResponse.json({ ...newForm, createdAt: new Date().toISOString() }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating form:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
