import { Badge } from '@/components/ui/badge';

interface RunDetailProps {
  data: Record<string, string | number>;
  status: 'pending' | 'complete' | 'failed';
  emailSentTo?: string | null;
  emailSentAt?: string | null;
}

export function RunDetail({ data, status, emailSentTo, emailSentAt }: RunDetailProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Run Details</h2>
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
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">{key}</p>
            <p className="mt-1 text-sm text-gray-900">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-600">
        {emailSentTo
          ? `Email sent to ${emailSentTo}${emailSentAt ? ` at ${new Date(emailSentAt).toLocaleString()}` : ''}.`
          : 'No email dispatch for this run.'}
      </div>
    </section>
  );
}
