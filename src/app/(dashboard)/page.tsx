import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = createClient();

  const [workflowCountRes, runsCountRes, weekRunsRes, recentRunsRes] = await Promise.all([
    supabase.from('workflows').select('*', { count: 'exact', head: true }),
    supabase.from('runs').select('*', { count: 'exact', head: true }),
    supabase
      .from('runs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('runs')
      .select('id, status, created_at, workflows:workflows(title)')
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  const stats = [
    { label: 'Total Workflows', value: workflowCountRes.count ?? 0 },
    { label: 'Total Runs', value: runsCountRes.count ?? 0 },
    { label: 'Runs This Week', value: weekRunsRes.count ?? 0 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Operational summary of your workflow activity.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Recent Runs</h2>
        {(recentRunsRes.data ?? []).length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No runs yet"
              description="Once you run a workflow, the latest executions will appear here with timestamps and status."
              className="bg-gray-50"
              actions={
                <div className="flex justify-center gap-3">
                  <Link href="/workflows/new">
                    <Button>Build a Workflow</Button>
                  </Link>
                  <Link href="/workflows">
                    <Button className="bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Browse Workflows</Button>
                  </Link>
                </div>
              }
            />
          </div>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-2 py-3">Workflow</th>
                  <th className="px-2 py-3">Timestamp</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Open</th>
                </tr>
              </thead>
              <tbody>
                {(recentRunsRes.data ?? []).map((run) => (
                  <tr key={run.id} className="border-b border-gray-50">
                    <td className="px-2 py-3 text-gray-700">{(run.workflows as { title?: string } | null)?.title ?? 'Workflow'}</td>
                    <td className="px-2 py-3 text-gray-600">{formatDate(run.created_at)}</td>
                    <td className="px-2 py-3">
                      <Badge
                        className={
                          run.status === 'complete'
                            ? 'bg-emerald-100 text-emerald-700'
                            : run.status === 'failed'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                        }
                      >
                        {run.status}
                      </Badge>
                    </td>
                    <td className="px-2 py-3">
                      <Link href={`/runs/${run.id}`} className="text-brand-700 hover:text-brand-600">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
