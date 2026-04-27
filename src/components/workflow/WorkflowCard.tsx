import Link from 'next/link';
import { FileText, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface WorkflowCardProps {
  id: string;
  title: string;
  description: string | null;
  outputFormat: 'pdf' | 'docx';
  runCount: number;
  lastRunAt?: string | null;
}

export function WorkflowCard({
  id,
  title,
  description,
  outputFormat,
  runCount,
  lastRunAt
}: WorkflowCardProps) {
  return (
    <Card className="flex h-full flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description || 'No description provided.'}</p>
        </div>
        <Badge>{outputFormat.toUpperCase()}</Badge>
      </div>

      <div className="mt-auto space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FileText size={14} />
          <span>{runCount} runs</span>
        </div>
        <p>{lastRunAt ? `Last run ${formatDate(lastRunAt)}` : 'No runs yet'}</p>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/workflows/${id}`} className="flex-1">
          <Button className="w-full bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">
            Open
          </Button>
        </Link>
        <Link href={`/workflows/${id}/run`} className="flex-1">
          <Button className="w-full gap-1">
            <Play size={14} />
            Run
          </Button>
        </Link>
      </div>
    </Card>
  );
}
