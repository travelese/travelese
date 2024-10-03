import { ErrorFallback } from "@/components/error-fallback";
import OrbitItinerary from "@/components/orbit-itinerary";
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
      </div>
      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense fallback={<div>Loading...</div>}>
          {/* <OrbitItinerary /> */}
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
