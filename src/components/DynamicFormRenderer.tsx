'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { FormMetadata, FormField } from '@/types';
import { buildZodSchema } from '@/lib/validation';
import { toast } from 'sonner';
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  form: FormMetadata;
}

export default function DynamicFormRenderer({ form }: Props) {
  const schema = buildZodSchema(form.fields);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: form.fields.reduce((acc, field) => {
      if (field.type === 'checkbox') {
        acc[field.id] = [];
      } else {
        acc[field.id] = '';
      }
      return acc;
    }, {} as Record<string, any>),
  });

  const mutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await fetch(`/api/forms/${form.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit response');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Your response has been saved directly to Google Sheets!');
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Submission failed. Please try again.');
    },
  });

  const onSubmit = (data: Record<string, any>) => {
    mutation.mutate(data);
  };

  const renderFieldInput = (field: FormField) => {
    const error = errors[field.id];
    const isError = !!error;

    const baseInputStyle = `w-full bg-neutral-900 border ${
      isError ? 'border-red-500/80 focus:ring-red-500/30' : 'border-neutral-800 focus:ring-indigo-500/30 focus:border-indigo-500'
    } rounded-xl px-4 py-3 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-4 transition-all duration-200`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            rows={4}
            placeholder={field.placeholder || 'Enter details...'}
            className={baseInputStyle}
            {...register(field.id)}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            className={baseInputStyle}
            {...register(field.id)}
            defaultValue=""
          >
            <option value="" disabled>
              {field.placeholder || 'Select an option...'}
            </option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt} className="bg-neutral-900">
                {opt}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2 mt-1">
            {field.options?.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-900 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-neutral-800/80 cursor-pointer transition-colors duration-200"
              >
                <input
                  type="radio"
                  value={opt}
                  className="w-4 h-4 text-indigo-600 border-neutral-800 bg-neutral-950 focus:ring-indigo-500/30 focus:ring-2"
                  {...register(field.id)}
                />
                <span className="text-sm text-neutral-300">{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <Controller
            control={control}
            name={field.id}
            render={({ field: { value, onChange } }) => (
              <div className="space-y-2 mt-1">
                {field.options?.map((opt) => {
                  const isChecked = Array.isArray(value) && value.includes(opt);
                  return (
                    <label
                      key={opt}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-900 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-neutral-800/80 cursor-pointer transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const newValue = isChecked
                            ? value.filter((v: string) => v !== opt)
                            : [...(value || []), opt];
                          onChange(newValue);
                        }}
                        className="w-4 h-4 text-indigo-600 border-neutral-800 bg-neutral-950 focus:ring-indigo-500/30 rounded focus:ring-2"
                      />
                      <span className="text-sm text-neutral-300">{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        );

      case 'date':
        return (
          <input
            id={field.id}
            type="date"
            className={baseInputStyle}
            {...register(field.id)}
          />
        );

      case 'number':
        return (
          <input
            id={field.id}
            type="number"
            placeholder={field.placeholder || 'e.g. 10'}
            className={baseInputStyle}
            {...register(field.id)}
          />
        );

      default:
        // text, email, tel, url
        return (
          <input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            className={baseInputStyle}
            {...register(field.id)}
          />
        );
    }
  };

  if (mutation.isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900/50 border border-neutral-800/60 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-sm"
      >
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-50 mb-2">Thank you!</h2>
        <p className="text-neutral-400 mb-6">
          Your response for <span className="font-semibold text-indigo-400">{form.name}</span> has been successfully submitted and stored.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => mutation.reset()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Submit Another Response
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto bg-neutral-900/20 border border-neutral-900 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-xs">
      <div className="border-b border-neutral-900 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-50">{form.name}</h1>
        {form.description && (
          <p className="text-neutral-400 mt-2 text-sm md:text-base leading-relaxed">{form.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {form.fields.map((field) => {
          const error = errors[field.id];
          const isFullWidth = ['textarea', 'checkbox', 'radio'].includes(field.type);
          return (
            <div key={field.id} className={`space-y-1.5 ${isFullWidth ? 'md:col-span-2' : 'col-span-1'}`}>
              <label htmlFor={field.id} className="block text-sm font-semibold text-neutral-300">
                {field.label}
                {field.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
              </label>
              {renderFieldInput(field)}
              {error && (
                <div className="flex items-center gap-1.5 text-rose-500 text-xs mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error.message as string}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-neutral-900 flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting response...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Response
            </>
          )}
        </button>
      </div>
    </form>
  );
}
