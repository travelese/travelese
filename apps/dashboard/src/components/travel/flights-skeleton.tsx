import { Skeleton } from "@travelese/ui/skeleton";

const slotsAmount = 10;

export function FlightSkeleton() {
  return (
    <div className="max-w-screen-lg mx-auto">
      <div className="w-full space-y-8 p-4">
        {Array.from({ length: slotsAmount }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full">
            <div className="flex flex-col items-start gap-4 p-4">
              <Skeleton className="w-[50%] h-4" />
              <Skeleton className="w-[40%] h-4" />
            </div>
          </Skeleton>
        ))}
      </div>
    </div>
  );
}
