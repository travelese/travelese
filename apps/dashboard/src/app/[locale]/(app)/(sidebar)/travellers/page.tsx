import { TravellersHeader } from "@/components/travellers-header";
import { ErrorFallback } from "@/components/error-fallback";
import { TravellersTable } from "@/components/tables/travellers";
import { TravellersSkeleton } from "@/components/tables/travellers/skeleton";
import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { searchParamsCache } from "./search-params";

export const metadata: Metadata = {
  title: "Travellers | Travelese",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const {
    q: query,
    sort,
    start,
    end,
    page,
  } = searchParamsCache.parse(searchParams);

  return (
    <div className="flex flex-col pt-6 gap-6">
      <TravellersHeader />

      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense fallback={<TravellersSkeleton />}>
          <TravellersTable
            query={query}
            sort={sort}
            start={start}
            end={end}
            page={page}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
