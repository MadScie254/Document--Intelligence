import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RunDetail } from '@/components/run/RunDetail';
import { createClient } from '@/lib/supabase/server';

export default async function RunDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: run, error } = await supabase.from('runs').select('*').eq('id', params.id).single();

  if (error || !run) {
    notFound();
  }

  const { data: workflow } = await supabase.from('workflows').select('*').eq('id', run.workflow_id).single();

  let signedUrl: string | null = null;
  if (run.file_path) {
    const { data } = await supabase.storage.from('run-outputs').createSignedUrl(run.file_path, 60);
    signedUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Run {run.id.slice(0, 8)}</h1>
            <p className="mt-1 text-sm text-gray-500">Workflow: {workflow?.title ?? run.workflow_id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {signedUrl && (
              <a href={signedUrl} download={run.file_name ?? undefined}>
                <Button>Download File</Button>
              </a>
            )}
            <Link href={`/workflows/${run.workflow_id}/run?sourceRun=${run.id}`}>
              <Button className="bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Re-run with same data</Button>
            </Link>
            <Link href={`/workflows/${run.workflow_id}/run`}>
              <Button className="bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Re-run with new data</Button>
            </Link>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <RunDetail
          data={(run.data ?? {}) as Record<string, string | number>}
          status={run.status}
          emailSentTo={run.email_sent_to}
          emailSentAt={run.email_sent_at}
        />
      </Card>
    </div>
  );
}
