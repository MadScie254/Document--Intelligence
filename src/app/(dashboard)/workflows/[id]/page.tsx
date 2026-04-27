import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RunCard } from '@/components/run/RunCard';
import { DeleteWorkflowButton } from '@/components/workflow/DeleteWorkflowButton';
import { createClient } from '@/lib/supabase/server';

export default async function WorkflowDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: workflow, error }, { data: runs }] = await Promise.all([
    supabase.from('workflows').select('*').eq('id', params.id).single(),
    supabase
      .from('runs')
      .select('*')
      .eq('workflow_id', params.id)
      .order('created_at', { ascending: false })
      .limit(50)
  ]);

  if (error || !workflow) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{workflow.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{workflow.description || 'No description provided.'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/workflows/${workflow.id}/run`}>
              <Button>Run</Button>
            </Link>
            <Link href={`/workflows/${workflow.id}/edit`}>
              <Button className="bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Edit</Button>
            </Link>
            <DeleteWorkflowButton workflowId={workflow.id} />
          </div>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Run History</h2>
        {(runs ?? []).length === 0 ? (
          <Card className="p-6 text-center text-sm text-gray-500">
            <p className="text-base font-medium text-gray-900">No runs yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Trigger the first run to generate a document and store the output version here.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href={`/workflows/${workflow.id}/run`}>
                <Button>Run this workflow</Button>
              </Link>
              <Link href={`/workflows/${workflow.id}/edit`}>
                <Button className="bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Edit workflow</Button>
              </Link>
            </div>
          </Card>
        ) : (
          (runs ?? []).map((run) => (
            <RunCard key={run.id} id={run.id} workflowTitle={workflow.title} createdAt={run.created_at} status={run.status} />
          ))
        )}
      </section>
    </div>
  );
}
