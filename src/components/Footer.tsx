import React from 'react';
import Link from 'next/link';
import { Database, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-neutral-950/60 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-base tracking-tight text-neutral-200">
              Sheet<span className="text-indigo-400">Form</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-neutral-400">
            <Link href="/" className="hover:text-neutral-200 transition-colors">
              Home
            </Link>
            <Link href="/forms" className="hover:text-neutral-200 transition-colors">
              Browse Forms
            </Link>
            <Link href="/admin" className="hover:text-neutral-200 transition-colors">
              Admin Dashboard
            </Link>
          </div>

          {/* Meta & Socials */}
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5">
              Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> &copy; {new Date().getFullYear()}
            </span>
            <span className="text-neutral-800">|</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
