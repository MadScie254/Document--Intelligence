import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function RunWorkflowLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
        <Card className="space-y-4 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
          <Skeleton className="h-10 w-36" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-3 h-48 w-full" />
        </Card>
      </div>
    </div>
  );
}
