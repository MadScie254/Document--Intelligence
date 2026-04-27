'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function DeleteWorkflowButton({ workflowId }: { workflowId: string }) {
  const router = useRouter();
  const { notify } = useToast();

  const remove = async () => {
    const confirmed = window.confirm('Delete this workflow and all runs?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete workflow');
      }

      notify('Workflow deleted.', 'success');
      router.replace('/workflows');
      router.refresh();
    } catch {
      notify('Failed to delete workflow.', 'error');
    }
  };

  return (
    <Button type="button" className="bg-rose-600 hover:bg-rose-700" onClick={remove}>
      Delete
    </Button>
  );
}