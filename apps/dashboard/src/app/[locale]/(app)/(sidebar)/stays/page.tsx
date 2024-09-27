import { ErrorFallback } from "@/components/error-fallback";
import { StaysResults } from "@/components/travel/stays/stays-results";
import { StaysResultsSkeleton } from "@/components/travel/stays/stays-results-skeleton";
import { StaysSearchForm } from "@/components/travel/stays/stays-search-form";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { searchParamsCache } from "./search-params";

export const metadata = {
  title: "Stays | Travelese",
};

export default async function Stays({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { location, checkInDate, checkOutDate, guests, rooms } =
    searchParamsCache.parse(searchParams);

  return (
    <div className="space-y-6">
      <StaysSearchForm />
      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense fallback={<StaysResultsSkeleton />}>
          <StaysResults
            location={location || ""}
            checkInDate={checkInDate || ""}
            checkOutDate={checkOutDate || ""}
            guests={guests}
            rooms={rooms}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
