import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function WorkflowDetailLoading() {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-3 h-4 w-80" />
        <div className="mt-5 flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </Card>
      <Card className="p-5">
        <Skeleton className="h-6 w-28" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
