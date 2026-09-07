import { NextRequest, NextResponse } from 'next/server';
import { getFormById, updateForm, deleteForm } from '@/lib/sheets';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const form = await getFormById(id);

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error: any) {
    console.error('Error fetching form by id:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, slug, description, fields } = body;

    const existingForm = await getFormById(id);
    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (slug !== undefined) updatedData.slug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (description !== undefined) updatedData.description = description;
    if (fields !== undefined) updatedData.fields = fields;

    await updateForm(id, updatedData);

    return NextResponse.json({ success: true, message: 'Form updated successfully' });
  } catch (error: any) {
    console.error('Error updating form:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existingForm = await getFormById(id);
    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    await deleteForm(id);

    return NextResponse.json({ success: true, message: 'Form and responses deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
