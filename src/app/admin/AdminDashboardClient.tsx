'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FormMetadata, FormField, FormFieldType } from '@/types';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Copy,
  LogOut,
  ChevronLeft,
  Settings,
  Download,
  Database,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Loader2,
  X,
  FileText
} from 'lucide-react';
import Link from 'next/link';

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email Input' },
  { value: 'tel', label: 'Phone Number' },
  { value: 'textarea', label: 'Textarea (Paragraph)' },
  { value: 'select', label: 'Select Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date Picker' },
  { value: 'number', label: 'Number Input' },
  { value: 'url', label: 'URL Input' },
];

export default function AdminDashboardClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<'list' | 'builder' | 'responses'>('list');
  const [selectedForm, setSelectedForm] = useState<FormMetadata | null>(null);
  
  // Builder State
  const [builderId, setBuilderId] = useState<string | null>(null); // null means creating
  const [builderName, setBuilderName] = useState('');
  const [builderSlug, setBuilderSlug] = useState('');
  const [builderDescription, setBuilderDescription] = useState('');
  const [builderFields, setBuilderFields] = useState<FormField[]>([]);
  const [slugModifiedManually, setSlugModifiedManually] = useState(false);

  // Queries
  const { data: forms = [], isLoading: isLoadingForms } = useQuery<FormMetadata[]>({
    queryKey: ['forms'],
    queryFn: async () => {
      const res = await fetch('/api/forms');
      if (!res.ok) throw new Error('Failed to fetch forms');
      return res.json();
    },
  });

  const { data: activeResponses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ['responses', selectedForm?.id],
    queryFn: async () => {
      if (!selectedForm) return [];
      const res = await fetch(`/api/forms/${selectedForm.id}/responses`);
      if (!res.ok) throw new Error('Failed to fetch responses');
      return res.json();
    },
    enabled: !!selectedForm && activeView === 'responses',
  });

  // Mutations
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
    },
    onSuccess: () => {
      toast.success('Logged out successfully');
      router.push('/admin/login');
      router.refresh();
    },
  });

  const saveFormMutation = useMutation({
    mutationFn: async () => {
      const url = builderId ? `/api/forms/${builderId}` : '/api/forms';
      const method = builderId ? 'PUT' : 'POST';
      const payload = {
        name: builderName,
        slug: builderSlug,
        description: builderDescription,
        fields: builderFields,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save form');
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success(builderId ? 'Form config updated!' : 'New form and sheets created!');
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      setActiveView('list');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error occurred while saving form.');
    },
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete form');
    },
    onSuccess: () => {
      toast.success('Form and associated response sheet deleted.');
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });

  // Actions
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBuilderName(val);
    if (!slugModifiedManually && !builderId) {
      setBuilderSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
    }
  };

  const openBuilder = (form?: FormMetadata) => {
    if (form) {
      // Edit mode
      setBuilderId(form.id);
      setBuilderName(form.name);
      setBuilderSlug(form.slug);
      setBuilderDescription(form.description || '');
      setBuilderFields(form.fields);
    } else {
      // Create mode
      setBuilderId(null);
      setBuilderName('');
      setBuilderSlug('');
      setBuilderDescription('');
      setBuilderFields([
        {
          id: 'field_name_' + Math.random().toString(36).substring(2, 6),
          type: 'text',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your name...',
        },
      ]);
    }
    setSlugModifiedManually(false);
    setActiveView('builder');
  };

  const addField = () => {
    const newField: FormField = {
      id: 'field_' + Math.random().toString(36).substring(2, 8),
      type: 'text',
      label: 'New Field Label',
      required: false,
      placeholder: '',
      options: [],
    };
    setBuilderFields([...builderFields, newField]);
  };

  const removeField = (index: number) => {
    setBuilderFields(builderFields.filter((_, i) => i !== index));
  };

  const updateFieldProperty = (index: number, key: keyof FormField, value: any) => {
    const updated = [...builderFields];
    updated[index] = { ...updated[index], [key]: value };
    setBuilderFields(updated);
  };

  const updateFieldOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updated = [...builderFields];
    const field = { ...updated[fieldIndex] };
    const options = [...(field.options || [])];
    options[optionIndex] = value;
    field.options = options;
    updated[fieldIndex] = field;
    setBuilderFields(updated);
  };

  const addFieldOption = (fieldIndex: number) => {
    const updated = [...builderFields];
    const field = { ...updated[fieldIndex] };
    field.options = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    updated[fieldIndex] = field;
    setBuilderFields(updated);
  };

  const removeFieldOption = (fieldIndex: number, optionIndex: number) => {
    const updated = [...builderFields];
    const field = { ...updated[fieldIndex] };
    field.options = (field.options || []).filter((_, i) => i !== optionIndex);
    updated[fieldIndex] = field;
    setBuilderFields(updated);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === builderFields.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...builderFields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBuilderFields(updated);
  };

  const copyFormLink = (slug: string) => {
    const link = `${window.location.origin}/forms/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success('Form link copied to clipboard!');
  };

  const exportCSV = () => {
    if (!selectedForm || activeResponses.length === 0) return;

    const headers = ['Submission ID', 'Submitted At', ...selectedForm.fields.map(f => f.label)];
    const fieldIds = selectedForm.fields.map(f => f.id);

    const rows: string[][] = activeResponses.map((r: any) => [
      r.id,
      r.submittedAt,
      ...fieldIds.map(fid => String(r.answers[fid] || '')),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row: string[]) => row.map(v => `"${v.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `responses_${selectedForm.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Responses exported as CSV!');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-neutral-900 bg-neutral-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white flex items-center gap-1.5">
                SheetForm <span className="text-xs bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 font-semibold px-2 py-0.5 rounded-md">Console</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => logoutMutation.mutate()}
              className="px-3.5 py-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-850 text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* LIST VIEW */}
        {activeView === 'list' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-50 tracking-tight">Active Schemas</h1>
                <p className="text-neutral-500 text-sm mt-1">Manage dynamically compiled spreadsheets and responses sheets.</p>
              </div>
              <button
                onClick={() => openBuilder()}
                className="w-full sm:w-auto px-4.5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create Form Schema
              </button>
            </div>

            {isLoadingForms ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-56 bg-neutral-900/40 border border-neutral-900 rounded-3xl p-6 animate-pulse space-y-4" />
                ))}
              </div>
            ) : forms.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-neutral-900 rounded-3xl max-w-xl mx-auto">
                <Layers className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-300">No form schemas</h3>
                <p className="text-neutral-500 text-sm mt-1">Get started by creating your first form schema and worksheets.</p>
                <button
                  onClick={() => openBuilder()}
                  className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Create Schema
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className="border border-neutral-900 bg-neutral-900/20 rounded-3xl p-6 flex flex-col justify-between hover:border-neutral-800 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h2 className="text-lg font-bold text-neutral-100 line-clamp-1">{form.name}</h2>
                        <span className="text-[10px] font-mono bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded-md text-neutral-400">
                          {form.fields.length} Fields
                        </span>
                      </div>
                      <p className="text-neutral-400 text-xs leading-relaxed mb-6 line-clamp-2">
                        {form.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="space-y-3.5 pt-4 border-t border-neutral-900 mt-auto">
                      {/* Copy Link & Slug Info */}
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span className="font-mono truncate max-w-[150px]">/{form.slug}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyFormLink(form.slug)}
                            className="p-1.5 hover:bg-neutral-900 border border-transparent hover:border-neutral-850 rounded-lg text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer"
                            title="Copy Live Link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            setSelectedForm(form);
                            setActiveView('responses');
                          }}
                          className="px-2 py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-neutral-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Data
                        </button>
                        <button
                          onClick={() => openBuilder(form)}
                          className="px-2 py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-neutral-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this form and all response rows in Sheets? This is irreversible.')) {
                              deleteFormMutation.mutate(form.id);
                            }
                          }}
                          disabled={deleteFormMutation.isPending}
                          className="px-2 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BUILDER VIEW (Create / Edit Form) */}
        {activeView === 'builder' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveView('list')}
                  className="p-2 bg-neutral-900 border border-neutral-850 rounded-xl text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl md:text-2xl font-extrabold text-neutral-50 tracking-tight">
                  {builderId ? 'Modify Form Schema' : 'Create Form Schema'}
                </h1>
              </div>
              <button
                onClick={() => saveFormMutation.mutate()}
                disabled={saveFormMutation.isPending || !builderName.trim() || !builderSlug.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
              >
                {saveFormMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  'Save Schema'
                )}
              </button>
            </div>

            {/* Inputs Block */}
            <div className="bg-neutral-900/10 border border-neutral-900 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-neutral-400">Form Name</label>
                  <input
                    type="text"
                    value={builderName}
                    onChange={handleNameChange}
                    className="w-full bg-neutral-900 border border-neutral-850 rounded-xl px-4 py-3 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    placeholder="Enter form name..."
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-neutral-400">URL Slug</label>
                  <input
                    type="text"
                    value={builderSlug}
                    onChange={(e) => {
                      setBuilderSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                      setSlugModifiedManually(true);
                    }}
                    className="w-full bg-neutral-900 border border-neutral-850 rounded-xl px-4 py-3 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    placeholder="form-url-slug"
                    required
                    disabled={!!builderId} // Protect slug mutation once created to avoid link breaking
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-neutral-400">Description (Optional)</label>
                <textarea
                  value={builderDescription}
                  onChange={(e) => setBuilderDescription(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-850 rounded-xl px-4 py-3 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  rows={3}
                  placeholder="Summarize the intent of this form..."
                />
              </div>
            </div>

            {/* Field Configurations List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <h2 className="text-lg font-bold text-neutral-200">Form Fields Configuration</h2>
                <button
                  type="button"
                  onClick={addField}
                  className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-indigo-400 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Field
                </button>
              </div>

              {builderFields.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-neutral-900 rounded-3xl">
                  <p className="text-neutral-500 text-sm">Add at least one input field to construct the form schema.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {builderFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="bg-neutral-900/10 border border-neutral-900 rounded-3xl p-5 space-y-4"
                    >
                      {/* Field Head */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-850 flex items-center justify-center text-xs text-neutral-400 font-mono">
                            {index + 1}
                          </span>
                          <span className="text-xs font-mono text-neutral-500">ID: {field.id}</span>
                        </div>
                        {/* Drag and Drop Helpers */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => moveField(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 bg-neutral-900 border border-neutral-850 rounded-lg text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveField(index, 'down')}
                            disabled={index === builderFields.length - 1}
                            className="p-1.5 bg-neutral-900 border border-neutral-850 rounded-lg text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="p-1.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Inputs row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-neutral-400">Field Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateFieldProperty(index, 'label', e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                            placeholder="e.g. Work Email Address"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-neutral-400">Field Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => {
                              const type = e.target.value as FormFieldType;
                              updateFieldProperty(index, 'type', type);
                              if (['select', 'radio', 'checkbox'].includes(type) && (!field.options || field.options.length === 0)) {
                                updateFieldProperty(index, 'options', ['Option 1', 'Option 2']);
                              }
                            }}
                            className="w-full bg-neutral-900 border border-neutral-850 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none"
                          >
                            {FIELD_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-neutral-400">Placeholder (Optional)</label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => updateFieldProperty(index, 'placeholder', e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                            placeholder="e.g. email@example.com"
                          />
                        </div>
                      </div>

                      {/* Required Toggle */}
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateFieldProperty(index, 'required', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-neutral-850 bg-neutral-950 focus:ring-indigo-500/30 rounded focus:ring-2"
                          />
                          <span className="text-xs font-semibold text-neutral-300">Required Input</span>
                        </label>
                      </div>

                      {/* Field Options Configuration (For multi choice) */}
                      {['select', 'radio', 'checkbox'].includes(field.type) && (
                        <div className="pt-3 border-t border-neutral-900 space-y-2">
                          <label className="block text-xs font-bold text-neutral-400">Multi-choice Options</label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {field.options?.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-850 rounded-lg pl-3 pr-1.5 py-1 text-xs">
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => updateFieldOption(index, optIdx, e.target.value)}
                                  className="bg-transparent text-neutral-200 focus:outline-none border-b border-transparent focus:border-neutral-700 max-w-[100px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeFieldOption(index, optIdx)}
                                  className="text-neutral-500 hover:text-rose-400 p-0.5 rounded"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addFieldOption(index)}
                              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-indigo-400 text-xs font-semibold rounded-lg flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Option
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESPONSES VIEW */}
        {activeView === 'responses' && selectedForm && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveView('list')}
                  className="p-2 bg-neutral-900 border border-neutral-850 rounded-xl text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl md:text-2xl font-extrabold text-neutral-50 tracking-tight">{selectedForm.name} Submissions</h1>
                  <p className="text-neutral-500 text-xs mt-0.5 font-mono">Dynamic spreadsheet connection verified.</p>
                </div>
              </div>
              
              {activeResponses.length > 0 && (
                <button
                  onClick={exportCSV}
                  className="w-full sm:w-auto px-4 py-2.5 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-neutral-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  Export as CSV
                </button>
              )}
            </div>

            {isLoadingResponses ? (
              <div className="bg-neutral-900/10 border border-neutral-900 rounded-3xl p-8 space-y-4 animate-pulse">
                <div className="h-6 bg-neutral-900 rounded w-1/4" />
                <div className="h-10 bg-neutral-900 rounded w-full" />
                <div className="h-10 bg-neutral-900 rounded w-full" />
              </div>
            ) : activeResponses.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-neutral-900 rounded-3xl max-w-xl mx-auto">
                <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-300">No submissions yet</h3>
                <p className="text-neutral-500 text-sm mt-1">Share the form link to start gathering user response data.</p>
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={() => copyFormLink(selectedForm.slug)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    Copy Form Link
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-neutral-900 rounded-3xl bg-neutral-900/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-neutral-900 border-b border-neutral-900 text-neutral-400 font-bold text-xs uppercase tracking-wider">
                        <th className="px-6 py-4.5 font-bold">Submission ID</th>
                        <th className="px-6 py-4.5 font-bold">Submitted At</th>
                        {selectedForm.fields.map((field) => (
                          <th key={field.id} className="px-6 py-4.5 font-bold">
                            {field.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900 text-neutral-300">
                      {activeResponses.map((response: any) => (
                        <tr key={response.id} className="hover:bg-neutral-900/30 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-indigo-400">{response.id}</td>
                          <td className="px-6 py-4 text-neutral-500">
                            {new Date(response.submittedAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          {selectedForm.fields.map((field) => (
                            <td key={field.id} className="px-6 py-4 max-w-xs truncate">
                              {response.answers[field.id] !== undefined
                                ? String(response.answers[field.id])
                                : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
