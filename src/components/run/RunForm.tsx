'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Workflow } from '@/types';
import { resolveTemplate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type RunValues = Record<string, string | number>;

interface RunFormProps {
  workflow: Workflow;
  initialValues?: RunValues;
  loading?: boolean;
  onSubmit: (values: RunValues) => Promise<void>;
}

function buildSchema(workflow: Workflow) {
  return z.object(
    Object.fromEntries(
      workflow.fields.map((field) => {
        if (field.type === 'number') {
          return [
            field.key,
            field.required
              ? z.coerce.number({ invalid_type_error: `${field.label} must be a number` })
              : z.coerce.number().optional()
          ];
        }

        return [field.key, field.required ? z.string().min(1, `${field.label} is required`) : z.string().optional()];
      })
    )
  );
}

export function RunForm({ workflow, initialValues, loading, onSubmit }: RunFormProps) {
  const schema = useMemo(() => buildSchema(workflow), [workflow]);

  const form = useForm<RunValues>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(
      workflow.fields.map((field) => [field.key, initialValues?.[field.key] ?? field.defaultValue ?? ''])
    )
  });

  const values = form.watch();
  const preview = resolveTemplate(workflow.template, values);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {workflow.fields.map((field) => {
          const error = form.formState.errors[field.key]?.message as string | undefined;

          return (
            <div key={field.key} className="space-y-1">
              <label className="text-sm text-gray-600">
                {field.label}
                {field.required ? ' *' : ''}
              </label>

              {field.type === 'textarea' && (
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder={field.placeholder}
                  {...form.register(field.key)}
                />
              )}

              {field.type === 'select' && (
                <Select {...form.register(field.key)}>
                  <option value="">Select {field.label}</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              )}

              {field.type !== 'textarea' && field.type !== 'select' && (
                <Input
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  placeholder={field.placeholder}
                  {...form.register(field.key)}
                />
              )}

              {error && <p className="text-xs text-rose-600">{error}</p>}
            </div>
          );
        })}

        <Button type="submit" disabled={Boolean(loading)}>
          Generate &amp; Run
        </Button>
      </form>

      <aside className="h-fit rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Live Template Preview</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">{preview || 'Preview appears here.'}</p>
      </aside>
    </div>
  );
}
