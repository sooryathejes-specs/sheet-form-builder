'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Database, Sparkles, Shield, Code, ChevronRight, FormInput } from 'lucide-react';
import { event } from '@/lib/analytics';

export default function Home() {
  const handleClick = () => {
    event({
      action: 'contact_button',
      category: 'engagement',
      label: 'Contact Us',
    });
  };

  const handleClicked = () => {
    event({
      action: 'contact_button_liked',
      category: 'engagement',
      label: 'Contact Us',
    });
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))] py-20 lg:py-32">
          <div className="absolute inset-0 -z-20 bg-neutral-950" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <div className="mb-6 inline-flex animate-pulse items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next.js 15 + Google Sheets Database</span>
              </div>

              {/* Title */}
              <h1 className="mb-6 text-4xl leading-[1.1] font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Build dynamic forms.
                <br />
                Store directly in{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
                  Google Sheets.
                </span>
              </h1>

              {/* Subheading */}
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-neutral-400 sm:text-xl">
                A complete, zero-dependency, open-source form builder. Create form validation schemas, gather data, and
                manage submissions using standard Google Worksheets.
              </p>

              {/* CTAs */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/admin"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-500 sm:w-auto"
                >
                  Create Form
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <button onClick={handleClick}>Contact Us</button>
                <button onClick={handleClicked}>Contact Us</button>

                <Link
                  href="/forms"
                  className="hover:bg-neutral-850 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-8 py-4 text-base font-semibold text-neutral-200 transition-colors sm:w-auto"
                >
                  Browse Forms
                </Link>
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="mx-auto mt-20 max-w-5xl rounded-2xl border border-neutral-800/80 bg-neutral-900/20 p-2 shadow-2xl shadow-indigo-500/5 backdrop-blur-xs">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 md:p-6">
                {/* Simulated Header */}
                <div className="mb-6 flex items-center justify-between border-b border-neutral-900 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-neutral-800" />
                    <span className="h-3 w-3 rounded-full bg-neutral-800" />
                    <span className="h-3 w-3 rounded-full bg-neutral-800" />
                    <span className="ml-2 font-mono text-xs text-neutral-500">sheet-form-builder.app</span>
                  </div>
                  <div className="border-neutral-850 flex items-center gap-1.5 rounded-lg border bg-neutral-900 px-3 py-1 text-xs font-semibold text-indigo-400">
                    <Database className="h-3 w-3" /> Live Sheets Sync
                  </div>
                </div>

                {/* Grid Simulator */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="rounded-xl border border-neutral-900 bg-neutral-900/10 p-4 md:col-span-2">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-400">
                      <FormInput className="h-4 w-4 text-indigo-400" /> Form Builder Console
                    </h3>
                    <div className="space-y-3">
                      <div className="border-neutral-850 flex h-10 items-center justify-between rounded-lg border bg-neutral-900 px-3 text-xs text-neutral-500">
                        <span>Full Name (Text Input)</span>
                        <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-400">
                          Required
                        </span>
                      </div>
                      <div className="border-neutral-850 flex h-10 items-center justify-between rounded-lg border bg-neutral-900 px-3 text-xs text-neutral-500">
                        <span>Work Email (Email Input)</span>
                        <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-400">
                          Required
                        </span>
                      </div>
                      <div className="border-neutral-850 flex h-10 items-center justify-between rounded-lg border bg-neutral-900 px-3 text-xs text-neutral-500">
                        <span>Experience Level (Select Dropdown)</span>
                        <span className="text-[10px]">Optional</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between rounded-xl border border-neutral-900 bg-neutral-900/10 p-4">
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-400">
                        <Database className="h-4 w-4 text-emerald-400" /> Sheet Responses
                      </h3>
                      <p className="text-xs leading-relaxed text-neutral-500">
                        Data flows directly from client validations through a serverless rate limiter and gets appended
                        into sheets rows automatically.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-neutral-900 pt-4 text-xs">
                      <span className="text-neutral-500">Spreadsheet ID</span>
                      <span className="font-mono text-neutral-300">...1A2b3C4d</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-y border-neutral-900 bg-neutral-950 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Designed for speed. Engineered for reliability.
              </h2>
              <p className="text-base text-neutral-400 sm:text-lg">
                We combine the simplicity of Google Sheets with the power of full-stack schema validation and a
                customizable builder.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="group rounded-2xl border border-neutral-900 bg-neutral-900/10 p-6 transition-all duration-300 hover:border-indigo-500/20">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 transition-transform group-hover:scale-110">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-neutral-100">Google Sheets DB</h3>
                <p className="text-sm leading-relaxed text-neutral-400">
                  Direct connection with Google Sheets API. Submissions trigger appending rows instantly. Real-time
                  updates without separate datastores.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-2xl border border-neutral-900 bg-neutral-900/10 p-6 transition-all duration-300 hover:border-indigo-500/20">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 transition-transform group-hover:scale-110">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-neutral-100">Strict Validation</h3>
                <p className="text-sm leading-relaxed text-neutral-400">
                  Dynamically compiled Zod schemas validated on both client (React Hook Form) and server side. No bad
                  inputs reach your sheet.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-2xl border border-neutral-900 bg-neutral-900/10 p-6 transition-all duration-300 hover:border-indigo-500/20">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 transition-transform group-hover:scale-110">
                  <Code className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-neutral-100">Full-Stack Control</h3>
                <p className="text-sm leading-relaxed text-neutral-400">
                  Next.js 15 App Router routing, rate limiting to stop API spammers, and secure credential storage using
                  environment configs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-neutral-950 py-20 lg:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_300px,rgba(99,102,241,0.08),rgba(255,255,255,0))]" />
          <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-5xl">
              Create your first spreadsheet form today.
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-base text-neutral-400 sm:text-lg">
              Deploy our dashboard, verify your Google Service Account, and start gathering responses with no code.
            </p>
            <Link
              href="/admin"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-neutral-950 shadow-xl shadow-white/5 transition-all duration-200 hover:bg-neutral-100"
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
