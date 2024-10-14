import { ErrorFallback } from "@/components/error-fallback";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { TravelWidget, TravelWidgetSkeleton } from "./travel-widget";

export function Travel({ date }) {
  return (
    <div className="border aspect-square overflow-hidden relative flex flex-col p-4 md:p-8">
      <h2 className="text-lg">Travel</h2>
      <Suspense>
        <TravelWidget />
      </Suspense>
    </div>
  );
}
