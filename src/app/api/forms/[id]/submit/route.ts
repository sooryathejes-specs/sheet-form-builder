import { NextRequest, NextResponse } from 'next/server';
import { getFormById, submitResponse } from '@/lib/sheets';
import { isRateLimited } from '@/lib/rate-limit';
import { buildZodSchema } from '@/lib/validation';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    // Clean ip (sometimes it comes as a list of proxy ips)
    const clientIp = ip.split(',')[0].trim();
    
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before submitting again.' },
        { status: 429 }
      );
    }

    // 2. Form metadata retrieval
    const form = await getFormById(id);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // 3. Request body parse
    const body = await req.json();

    // 4. Server-Side Validation
    const zodSchema = buildZodSchema(form.fields);
    const validationResult = zodSchema.safeParse(body);

    if (!validationResult.success) {
      // Format validation errors
      const formattedErrors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: 'Validation failed', details: formattedErrors },
        { status: 400 }
      );
    }

    // 5. Google Sheets persistence
    const submissionResult = await submitResponse(id, validationResult.data);

    return NextResponse.json({
      success: true,
      message: 'Response submitted successfully',
      submission: submissionResult,
    });
  } catch (error: any) {
    console.error('Error handling form submission:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
