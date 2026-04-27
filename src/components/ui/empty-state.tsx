import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, actions, className }: EmptyStateProps) {
  return (
    <Card className={cn('border-dashed border-gray-300 p-8 text-center', className)}>
      <div className="mx-auto max-w-xl space-y-2">
        <p className="text-base font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
        {actions ? <div className="pt-3">{actions}</div> : null}
      </div>
    </Card>
  );
}
