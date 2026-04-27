import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewWorkflowLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Card className="p-5">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
