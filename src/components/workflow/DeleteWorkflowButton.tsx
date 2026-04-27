'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function DeleteWorkflowButton({ workflowId }: { workflowId: string }) {
  const router = useRouter();
  const { notify } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);

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
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2">
        <span className="px-2 text-xs font-medium text-rose-700">Delete workflow?</span>
        <Button type="button" className="bg-rose-600 px-3 py-1 text-xs hover:bg-rose-700" onClick={remove} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Confirm'}
        </Button>
        <Button
          type="button"
          className="bg-white px-3 py-1 text-xs text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
          onClick={() => setConfirming(false)}
          disabled={deleting}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button type="button" className="bg-rose-600 hover:bg-rose-700" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  );
}