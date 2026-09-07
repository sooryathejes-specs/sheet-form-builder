import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Database, Sparkles, Shield, Code, ChevronRight, FormInput } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))]">
          <div className="absolute inset-0 bg-neutral-950 -z-20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next.js 15 + Google Sheets Database</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                Build dynamic forms.
                <br />
                Store directly in{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
                  Google Sheets.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                A complete, zero-dependency, open-source form builder. Create form validation schemas, gather data, and manage submissions using standard Google Worksheets.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/admin"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-indigo-600/20"
                >
                  Create Form
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/forms"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-200 font-semibold text-base transition-colors"
                >
                  Browse Forms
                </Link>
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="mt-20 border border-neutral-800/80 rounded-2xl bg-neutral-900/20 p-2 shadow-2xl shadow-indigo-500/5 max-w-5xl mx-auto backdrop-blur-xs">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 md:p-6">
                {/* Simulated Header */}
                <div className="flex items-center justify-between border-b border-neutral-900 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-neutral-800" />
                    <span className="w-3 h-3 rounded-full bg-neutral-800" />
                    <span className="w-3 h-3 rounded-full bg-neutral-800" />
                    <span className="text-xs text-neutral-500 ml-2 font-mono">sheet-form-builder.app</span>
                  </div>
                  <div className="px-3 py-1 bg-neutral-900 border border-neutral-850 rounded-lg text-xs text-indigo-400 font-semibold flex items-center gap-1.5">
                    <Database className="w-3 h-3" /> Live Sheets Sync
                  </div>
                </div>

                {/* Grid Simulator */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 border border-neutral-900 rounded-xl p-4 bg-neutral-900/10">
                    <h3 className="text-sm font-semibold text-neutral-400 mb-4 flex items-center gap-2">
                      <FormInput className="w-4 h-4 text-indigo-400" /> Form Builder Console
                    </h3>
                    <div className="space-y-3">
                      <div className="h-10 bg-neutral-900 rounded-lg border border-neutral-850 flex items-center px-3 justify-between text-xs text-neutral-500">
                        <span>Full Name (Text Input)</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px]">Required</span>
                      </div>
                      <div className="h-10 bg-neutral-900 rounded-lg border border-neutral-850 flex items-center px-3 justify-between text-xs text-neutral-500">
                        <span>Work Email (Email Input)</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px]">Required</span>
                      </div>
                      <div className="h-10 bg-neutral-900 rounded-lg border border-neutral-850 flex items-center px-3 justify-between text-xs text-neutral-500">
                        <span>Experience Level (Select Dropdown)</span>
                        <span className="text-[10px]">Optional</span>
                      </div>
                    </div>
                  </div>
                  <div className="border border-neutral-900 rounded-xl p-4 bg-neutral-900/10 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-400 mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-400" /> Sheet Responses
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Data flows directly from client validations through a serverless rate limiter and gets appended into sheets rows automatically.
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-900 flex justify-between items-center text-xs">
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
        <section className="py-24 border-y border-neutral-900 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Designed for speed. Engineered for reliability.
              </h2>
              <p className="text-neutral-400 text-base sm:text-lg">
                We combine the simplicity of Google Sheets with the power of full-stack schema validation and a customizable builder.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="border border-neutral-900 bg-neutral-900/10 rounded-2xl p-6 hover:border-indigo-500/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-neutral-100 mb-2">Google Sheets DB</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Direct connection with Google Sheets API. Submissions trigger appending rows instantly. Real-time updates without separate datastores.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="border border-neutral-900 bg-neutral-900/10 rounded-2xl p-6 hover:border-indigo-500/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-neutral-100 mb-2">Strict Validation</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Dynamically compiled Zod schemas validated on both client (React Hook Form) and server side. No bad inputs reach your sheet.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="border border-neutral-900 bg-neutral-900/10 rounded-2xl p-6 hover:border-indigo-500/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Code className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-neutral-100 mb-2">Full-Stack Control</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Next.js 15 App Router routing, rate limiting to stop API spammers, and secure credential storage using environment configs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28 relative overflow-hidden bg-neutral-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_300px,rgba(99,102,241,0.08),rgba(255,255,255,0))]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Create your first spreadsheet form today.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg mb-10 max-w-xl mx-auto">
              Deploy our dashboard, verify your Google Service Account, and start gathering responses with no code.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-base transition-all duration-200 shadow-xl shadow-white/5 cursor-pointer"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
