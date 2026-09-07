import React from 'react';
import { getFormBySlug } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DynamicFormRenderer from '@/components/DynamicFormRenderer';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);
  return {
    title: form ? `${form.name} | SheetForm` : 'Form Not Found',
    description: form?.description || 'Submit responses directly to Google Sheets.',
  };
}

export default async function FormSubmitPage({ params }: PageProps) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);

  if (!form) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-20 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DynamicFormRenderer form={form} />
        </div>
      </main>
      <Footer />
    </>
  );
}
