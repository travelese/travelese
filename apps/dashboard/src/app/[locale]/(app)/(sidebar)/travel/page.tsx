import { ErrorFallback } from "@/components/error-fallback";
import OrbitItinerary from "@/components/orbit-itinerary";
import TravelSearch from "@/components/travel-search";
import Provider from "@travelese/orbit/provider";
import StyledComponentsRegistry from "@travelese/orbit/registry";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import React, { Suspense } from "react";

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
          <Provider>
            <StyledComponentsRegistry>
              <OrbitItinerary />
            </StyledComponentsRegistry>
          </Provider>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
