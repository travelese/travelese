import { ErrorFallback } from "@/components/error-fallback";
import TravelSearch from "@/components/travel-search";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";

export const metadata = {
  title: "Travel | Travelese",
};

export default async function Travel() {
  return (
    <>
      <div className="flex justify-between py-6">
        <TravelSearch />
        <ErrorBoundary errorComponent={ErrorFallback}>
          <Suspense fallback={<div>Loading...</div>}>
            {/* Your component here */}
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
}
