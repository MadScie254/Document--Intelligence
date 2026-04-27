import { redirect } from 'next/navigation';
import { WorkflowBuilder } from '@/components/workflow/WorkflowBuilder';
import { createClient } from '@/lib/supabase/server';

export default async function NewWorkflowPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Create Workflow</h1>
      <WorkflowBuilder userId={user.id} />
    </div>
  );
}
