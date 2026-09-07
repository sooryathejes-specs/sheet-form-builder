'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FormMetadata } from '@/types';
import { Search, Calendar, ChevronRight, FileText, ChevronLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 6;

export default function FormsListClient() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: forms = [], isLoading, isError } = useQuery<FormMetadata[]>({
    queryKey: ['forms'],
    queryFn: async () => {
      const res = await fetch('/api/forms');
      if (!res.ok) throw new Error('Failed to load forms');
      return res.json();
    },
  });

  // Filter forms based on search query
  const filteredForms = forms.filter(
    (form) =>
      form.name.toLowerCase().includes(search.toLowerCase()) ||
      form.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredForms.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedForms = filteredForms.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Search Bar Skeleton */}
        <div className="h-12 bg-neutral-900 border border-neutral-800 rounded-xl animate-pulse w-full max-w-md" />
        
        {/* Cards Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-48 border border-neutral-900 bg-neutral-900/10 rounded-2xl p-6 space-y-4 animate-pulse"
            >
              <div className="w-10 h-10 bg-neutral-900 rounded-xl" />
              <div className="h-5 bg-neutral-900 rounded w-2/3" />
              <div className="h-4 bg-neutral-900 rounded w-5/6" />
              <div className="h-4 bg-neutral-900 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 border border-dashed border-red-500/20 rounded-2xl bg-red-500/5 max-w-xl mx-auto">
        <h3 className="text-lg font-semibold text-red-400">Failed to load forms</h3>
        <p className="text-neutral-400 text-sm mt-1">Please try refreshing the page or check your connection.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-850"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-4.5 h-4.5" />
        </span>
        <input
          type="text"
          placeholder="Search active forms..."
          value={search}
          onChange={handleSearchChange}
          className="w-full bg-neutral-900 border border-neutral-850 rounded-xl pl-11 pr-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200"
        />
      </div>

      {filteredForms.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-900 rounded-3xl max-w-xl mx-auto">
          <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-300">No forms found</h3>
          <p className="text-neutral-500 text-sm mt-1">Try refining your search keyword or create a form as administrator.</p>
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {paginatedForms.map((form) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  key={form.id}
                  className="border border-neutral-900 hover:border-neutral-800 bg-neutral-900/10 hover:bg-neutral-900/40 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-black/20 transition-all duration-300 group"
                >
                  <div>
                    {/* Icon Header */}
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-200 mb-5">
                      <FileText className="w-5 h-5" />
                    </div>

                    <h2 className="text-lg font-bold text-neutral-100 mb-2 group-hover:text-indigo-400 transition-colors">
                      {form.name}
                    </h2>
                    
                    <p className="text-neutral-400 text-sm leading-relaxed mb-6 line-clamp-2">
                      {form.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-900 flex items-center justify-between mt-auto">
                    {/* Created Date */}
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(form.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    {/* View Link */}
                    <Link
                      href={`/forms/${form.slug}`}
                      className="text-xs text-indigo-400 font-semibold flex items-center gap-1 hover:text-indigo-300 transition-colors group-hover:translate-x-0.5 transition-transform"
                    >
                      Fill Form
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-neutral-900 hover:border-neutral-800 bg-neutral-900/20 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-sm text-neutral-400 px-4 font-semibold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-neutral-900 hover:border-neutral-800 bg-neutral-900/20 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
