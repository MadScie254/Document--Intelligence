import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { WorkflowCard } from '@/components/workflow/WorkflowCard';
import { createClient } from '@/lib/supabase/server';

export default async function WorkflowsPage() {
  const supabase = createClient();

  const [{ data: workflows }, { data: runs }] = await Promise.all([
    supabase.from('workflows').select('*').order('created_at', { ascending: false }),
    supabase.from('runs').select('id, workflow_id, created_at').order('created_at', { ascending: false })
  ]);

  const runsByWorkflow = (runs ?? []).reduce<Record<string, { count: number; lastRunAt?: string }>>((acc, run) => {
    const existing = acc[run.workflow_id] ?? { count: 0 };
    acc[run.workflow_id] = {
      count: existing.count + 1,
      lastRunAt: existing.lastRunAt ?? run.created_at
    };
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Workflows</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage document automation templates.</p>
        </div>
        <Link href="/workflows/new">
          <Button>New Workflow</Button>
        </Link>
      </div>

      {(workflows ?? []).length === 0 ? (
        <EmptyState
          title="No workflows yet"
          description="Start by creating a workflow template. You’ll define fields, the output format, and the document text in one place."
          actions={
            <div className="flex justify-center gap-3">
              <Link href="/workflows/new">
                <Button>Create your first workflow</Button>
              </Link>
              <Link href="/">
                <Button className="bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Back to dashboard</Button>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(workflows ?? []).map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              id={workflow.id}
              title={workflow.title}
              description={workflow.description}
              outputFormat={workflow.output_format}
              runCount={runsByWorkflow[workflow.id]?.count ?? 0}
              lastRunAt={runsByWorkflow[workflow.id]?.lastRunAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
