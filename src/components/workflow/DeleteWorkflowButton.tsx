'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
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
      const supabase = createClient();
      const { error } = await supabase.from('workflows').delete().eq('id', workflowId);
      if (error) {
        throw error;
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