import { Card } from '@/components/ui/card';
import { RunCard } from '@/components/run/RunCard';
import { createClient } from '@/lib/supabase/server';

export default async function RecentRunsPage() {
  const supabase = createClient();

  const { data: runs } = await supabase
    .from('runs')
    .select('id, status, created_at, workflow_id, workflows:workflows(title)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Recent Runs</h1>
        <p className="mt-1 text-sm text-gray-500">Most recent run executions across all workflows.</p>
      </div>

      {(runs ?? []).length === 0 ? (
        <Card className="p-6 text-sm text-gray-500">No runs yet.</Card>
      ) : (
        <div className="space-y-3">
          {(runs ?? []).map((run) => (
            <RunCard
              key={run.id}
              id={run.id}
              workflowTitle={(run.workflows as { title?: string } | null)?.title}
              createdAt={run.created_at}
              status={run.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}