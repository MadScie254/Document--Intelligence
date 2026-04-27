import Link from 'next/link';
import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface RunCardProps {
  id: string;
  workflowTitle?: string;
  createdAt: string;
  status: 'pending' | 'complete' | 'failed';
}

export function RunCard({ id, workflowTitle, createdAt, status }: RunCardProps) {
  return (
    <Card className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{workflowTitle || 'Workflow Run'}</p>
        <p className="text-xs text-gray-500">{formatDate(createdAt)}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          className={
            status === 'complete'
              ? 'bg-emerald-100 text-emerald-700'
              : status === 'failed'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
          }
        >
          {status}
        </Badge>
        <Link href={`/runs/${id}`} className="text-gray-500 transition hover:text-gray-800">
          <Download size={16} />
        </Link>
      </div>
    </Card>
  );
}
