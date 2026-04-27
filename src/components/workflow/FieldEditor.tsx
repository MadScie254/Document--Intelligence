import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { FieldSchema, FieldType } from '@/types';

interface FieldEditorProps {
  field: FieldSchema;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (index: number, next: FieldSchema) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

export function FieldEditor({
  field,
  index,
  canMoveUp,
  canMoveDown,
  onChange,
  onDelete,
  onMove
}: FieldEditorProps) {
  const onTypeChange = (type: FieldType) => {
    onChange(index, {
      ...field,
      type,
      options: type === 'select' ? field.options ?? [] : undefined
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Label</label>
          <Input
            value={field.label}
            onChange={(event) => onChange(index, { ...field, label: event.target.value })}
            placeholder="Field label"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Key</label>
          <Input
            value={field.key}
            onChange={(event) => onChange(index, { ...field, key: event.target.value })}
            placeholder="field_key"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Type</label>
          <Select
            value={field.type}
            onChange={(event) => onTypeChange(event.target.value as FieldType)}
          >
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="select">Select</option>
          </Select>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Placeholder</label>
          <Input
            value={field.placeholder ?? ''}
            onChange={(event) => onChange(index, { ...field, placeholder: event.target.value })}
            placeholder="Optional placeholder"
          />
        </div>

        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(event) => onChange(index, { ...field, required: event.target.checked })}
            />
            Required
          </label>
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              className="bg-white px-2 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
              onClick={() => onMove(index, 'up')}
              disabled={!canMoveUp}
            >
              <ArrowUp size={14} />
            </Button>
            <Button
              type="button"
              className="bg-white px-2 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
              onClick={() => onMove(index, 'down')}
              disabled={!canMoveDown}
            >
              <ArrowDown size={14} />
            </Button>
            <Button
              type="button"
              className="bg-rose-50 px-2 text-rose-700 hover:bg-rose-100"
              onClick={() => onDelete(index)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>

      {field.type === 'select' && (
        <div className="mt-3">
          <label className="mb-1 block text-xs text-gray-500">Options (comma separated)</label>
          <Input
            value={(field.options ?? []).join(', ')}
            onChange={(event) => {
              const options = event.target.value
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean);
              onChange(index, { ...field, options });
            }}
            placeholder="Option A, Option B"
          />
        </div>
      )}
    </div>
  );
}
