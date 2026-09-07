import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FormsListClient from './FormsListClient';

export const metadata = {
  title: 'Available Forms | SheetForm',
  description: 'Search and submit responses to active surveys, feedback forms, and registrations.',
};

export default function FormsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-20 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-50 tracking-tight">Active Forms</h1>
            <p className="text-neutral-400 mt-2 text-sm md:text-base">
              Select any form below to fill out responses. Submission data is sent in real-time.
            </p>
          </div>
          <FormsListClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
