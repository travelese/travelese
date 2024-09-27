import { ErrorFallback } from "@/components/error-fallback";
import { FlightsResults } from "@/components/travel/flights/flights-results";
import { FlightsResultsSkeleton } from "@/components/travel/flights/flights-results-skeleton";
import { FlightsSearchForm } from "@/components/travel/flights/flights-search-form";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { searchParamsCache } from "./search-params";

export const metadata = {
  title: "Flights | Travelese",
};

export default async function Flights({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    passengers,
    cabinClass,
  } = searchParamsCache.parse(searchParams);

  return (
    <div className="space-y-6">
      <FlightsSearchForm />
      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense fallback={<FlightsResultsSkeleton />}>
          <FlightsResults
            origin={origin}
            destination={destination}
            departureDate={departureDate}
            returnDate={returnDate}
            passengers={passengers}
            cabinClass={cabinClass}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
