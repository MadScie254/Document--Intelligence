import { notFound, redirect } from 'next/navigation';
import { WorkflowBuilder } from '@/components/workflow/WorkflowBuilder';
import { createClient } from '@/lib/supabase/server';
import type { Workflow } from '@/types';

export default async function EditWorkflowPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: workflow, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !workflow) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Edit Workflow</h1>
      <WorkflowBuilder workflow={workflow as Workflow} />
    </div>
  );
}
