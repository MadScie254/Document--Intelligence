export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select';

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  output_format: 'pdf' | 'docx';
  fields: FieldSchema[];
  template: string;
  email_to: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: string;
  workflow_id: string;
  user_id: string;
  data: Record<string, string | number>;
  file_path: string | null;
  file_name: string | null;
  output_format: 'pdf' | 'docx';
  email_sent_to: string | null;
  email_sent_at: string | null;
  status: 'pending' | 'complete' | 'failed';
  error_message: string | null;
  created_at: string;
}

export type WorkflowFormData = Pick<
  Workflow,
  'title' | 'description' | 'output_format' | 'fields' | 'template' | 'email_to'
>;
