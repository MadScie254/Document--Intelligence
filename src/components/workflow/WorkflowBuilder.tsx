'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import type { FieldSchema, Workflow, WorkflowFormData } from '@/types';
import { FieldEditor } from '@/components/workflow/FieldEditor';
import { resolveTemplate } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  output_format: z.enum(['pdf', 'docx']),
  template: z.string().min(1, 'Template is required'),
  email_to: z.string().optional()
});

interface WorkflowBuilderProps {
  workflow?: Workflow;
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const createField = (index: number): FieldSchema => ({
  key: `field_${index + 1}`,
  label: `Field ${index + 1}`,
  type: 'text',
  required: true,
  placeholder: ''
});

export function WorkflowBuilder({ workflow }: WorkflowBuilderProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<FieldSchema[]>(workflow?.fields ?? [createField(0)]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: workflow?.title ?? '',
      description: workflow?.description ?? '',
      output_format: workflow?.output_format ?? 'pdf',
      template: workflow?.template ?? '',
      email_to: workflow?.email_to ?? ''
    }
  });

  const samplePreview = useMemo(() => {
    const sampleData = Object.fromEntries(fields.map((field) => [field.key, field.defaultValue || `[${field.label}]`]));
    return resolveTemplate(form.watch('template') || '', sampleData);
  }, [fields, form]);

  const addField = () => {
    setFields((prev) => [...prev, createField(prev.length)]);
  };

  const updateField = (index: number, nextField: FieldSchema) => {
    setFields((prev) =>
      prev.map((field, fieldIndex) => {
        if (fieldIndex !== index) {
          return field;
        }

        const shouldAutoSlug = field.key === slugify(field.label) || field.key.startsWith('field_');
        const nextKey = shouldAutoSlug ? slugify(nextField.label) || nextField.key : nextField.key;
        return { ...nextField, key: nextKey };
      })
    );
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, fieldIndex) => fieldIndex !== index));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    setFields((prev) => {
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= prev.length) {
        return prev;
      }

      const next = [...prev];
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  };

  const insertTemplateKey = (key: string) => {
    const current = form.getValues('template') || '';
    form.setValue('template', `${current}{{${key}}}`, { shouldValidate: true });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!fields.length) {
      notify('Add at least one field before saving.', 'error');
      return;
    }

    const invalidKey = fields.find((field) => !field.key || !/^\w+$/.test(field.key));
    if (invalidKey) {
      notify('Each field key must be alphanumeric/underscore and non-empty.', 'error');
      return;
    }

    setSaving(true);

    try {
      const payload: WorkflowFormData & { id?: string } = {
        ...values,
        description: values.description || null,
        email_to: values.email_to || null,
        fields
      };

      if (workflow?.id) {
        payload.id = workflow.id;
      }

      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save workflow');
      }

      notify('Workflow saved successfully.', 'success');
      router.push(`/workflows/${result.data.id}`);
      router.refresh();
    } catch {
      notify('Failed to save workflow.', 'error');
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-gray-900">Workflow Settings</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-500">Title</label>
            <Input {...form.register('title')} placeholder="Invoice Generator" />
            {form.formState.errors.title && (
              <p className="mt-1 text-xs text-rose-600">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-500">Description</label>
            <Input {...form.register('description')} placeholder="Describe what this workflow does" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-500">Output Format</label>
            <Select {...form.register('output_format')}>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-500">Email Recipients (optional)</label>
            <Input {...form.register('email_to')} placeholder="ops@example.com, legal@example.com" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-500">Template</label>
            <textarea
              rows={7}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              {...form.register('template')}
              placeholder="Dear {{name}}, your invoice total is {{amount}}"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {fields.map((field) => (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => insertTemplateKey(field.key)}
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-brand-100"
                >
                  {`{{${field.key}}}`}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">Character count: {(form.watch('template') || '').length}</p>
          </div>

          <div className="md:col-span-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Preview with sample data</p>
            <p className="whitespace-pre-wrap text-sm text-gray-700">{samplePreview || 'Template preview appears here.'}</p>
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Workflow'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Form Fields</h2>
          <Button type="button" onClick={addField} className="gap-1">
            <Plus size={14} />
            Add Field
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <FieldEditor
              key={`${field.key}-${index}`}
              field={field}
              index={index}
              canMoveUp={index > 0}
              canMoveDown={index < fields.length - 1}
              onChange={updateField}
              onDelete={removeField}
              onMove={moveField}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
