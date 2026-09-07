import { NextRequest, NextResponse } from 'next/server';
import { getFormById, getResponses } from '@/lib/sheets';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if form exists
    const form = await getFormById(id);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const responses = await getResponses(id);

    return NextResponse.json(responses);
  } catch (error: any) {
    console.error('Error fetching responses:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
