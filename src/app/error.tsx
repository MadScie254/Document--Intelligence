'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#f8f9fb] p-6">
        <div className="max-w-lg rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-500">
            We hit an unexpected problem. You can try again, or reload the page if the issue persists.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button type="button" onClick={reset}>
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
