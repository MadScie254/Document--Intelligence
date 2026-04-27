'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
      <h2 className="text-xl font-semibold text-rose-900">Unable to load this area</h2>
      <p className="mt-2 text-sm text-rose-700">A dashboard section failed to render. Refreshing may clear the issue.</p>
      <Button type="button" className="mt-4 bg-rose-600 hover:bg-rose-700" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
