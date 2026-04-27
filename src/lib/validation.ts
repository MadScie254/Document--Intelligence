import { z } from 'zod';

const fieldTypeSchema = z.enum(['text', 'textarea', 'number', 'date', 'select']);

export const fieldSchema = z.object({
  key: z.string().trim().regex(/^\w+$/, 'Field keys can only include letters, numbers, and underscores'),
  label: z.string().trim().min(1, 'Field label is required'),
  type: fieldTypeSchema,
  required: z.boolean(),
  placeholder: z.string().optional(),
  options: z.array(z.string().trim().min(1)).optional(),
  defaultValue: z.string().optional()
});

export const workflowPayloadSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2, 'Title is required').max(120, 'Title is too long'),
  description: z.string().trim().max(500).nullable().optional(),
  output_format: z.enum(['pdf', 'docx']),
  fields: z.array(fieldSchema).min(1, 'Add at least one field'),
  template: z.string().trim().min(1, 'Template is required').max(12000, 'Template is too long'),
  email_to: z.string().trim().max(2000).nullable().optional(),
  is_active: z.boolean().optional()
}).superRefine((value, ctx) => {
  const keys = value.fields.map((field) => field.key);
  const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);

  if (duplicateKeys.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['fields'],
      message: 'Field keys must be unique'
    });
  }

  value.fields.forEach((field, index) => {
    if (field.type === 'select' && (!field.options || field.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fields', index, 'options'],
        message: 'Select fields need at least one option'
      });
    }
  });
});

export const runCreatePayloadSchema = z.object({
  workflowId: z.string().uuid(),
  data: z.record(z.union([z.string(), z.number()])),
  outputFormat: z.enum(['pdf', 'docx'])
});

export const runFinalizePayloadSchema = z.object({
  runId: z.string().uuid(),
  filePath: z.string().min(1),
  fileName: z.string().min(1),
  status: z.enum(['complete', 'failed']).default('complete'),
  emailSentTo: z.string().nullable().optional(),
  emailSentAt: z.string().datetime().nullable().optional(),
  errorMessage: z.string().nullable().optional()
});

export type WorkflowPayload = z.infer<typeof workflowPayloadSchema>;
export type RunCreatePayload = z.infer<typeof runCreatePayloadSchema>;
export type RunFinalizePayload = z.infer<typeof runFinalizePayloadSchema>;
