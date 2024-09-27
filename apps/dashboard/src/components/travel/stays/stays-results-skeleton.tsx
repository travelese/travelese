import { Skeleton } from "@travelese/ui/skeleton";

export function StaysResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} className="h-48 w-full rounded-lg" />
      ))}
    </div>
  );
}
