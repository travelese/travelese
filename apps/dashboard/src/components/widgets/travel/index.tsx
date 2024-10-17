import { ErrorFallback } from "@/components/error-fallback";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import {
  TravelWidgetServer,
  TravelWidgetSkeleton,
} from "./travel-widget.server";

type Props = {
  date: string;
};

export function Travel({ date }: Props) {
  return (
    <div className="border aspect-square overflow-hidden relative p-4 md:p-8">
      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense fallback={<TravelWidgetSkeleton key={date} />}>
          <TravelWidgetServer date={date} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
