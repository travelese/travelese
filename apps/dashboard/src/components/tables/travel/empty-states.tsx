"use client";

import { useTravelParams } from "@/hooks/use-travel-params";
import { Button } from "@travelese/ui/button";

export function EmptyState() {
  const { setParams } = useTravelParams();

  return (
    <div className="flex items-center justify-center ">
      <div className="flex flex-col items-center mt-14">
        <div className="text-center mb-6 space-y-2">
          <h2 className="font-medium text-lg">No bookings</h2>
          <p className="text-[#606060] text-sm">
            You haven't created any bookings yet. <br />
            Go ahead and create your first one.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            setParams({
              create: true,
            })
          }
        >
          Create booking
        </Button>
      </div>
    </div>
  );
}

export function NoResults() {
  const { setParams } = useTravelParams();

  return (
    <div className="flex items-center justify-center ">
      <div className="flex flex-col items-center mt-14">
        <div className="text-center mb-6 space-y-2">
          <h2 className="font-medium text-lg">No results</h2>
          <p className="text-[#606060] text-sm">
            Try another search, or adjusting the filters
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setParams(null, { shallow: false })}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
