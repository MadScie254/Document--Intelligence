import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          No workflows yet. Create your first workflow to begin.
        </div>
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
