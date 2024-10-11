import { ErrorFallback } from "@/components/error-fallback";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { FlightsWidget, FlightsWidgetSkeleton } from "./flights-widget";

export function Flights() {
  return (
    <div className="border aspect-square overflow-hidden relative p-4 md:p-8">
      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense fallback={<FlightsWidgetSkeleton />}>
          <FlightsWidget />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
