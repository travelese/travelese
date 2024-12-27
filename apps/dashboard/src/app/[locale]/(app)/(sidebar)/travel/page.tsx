import { ErrorFallback } from "@/components/error-fallback";
import {
  OpenTravelBookSheet,
  OpenTravelChangeSheet,
  OpenTravelExploreSheet,
  OpenTravelSearchSheet,
} from "@/components/open-travel-sheet";
import { TravelTable } from "@/components/tables/travel";
import { Loading } from "@/components/tables/travel/loading";
import { TravelCalendar } from "@/components/travel-calendar";
import TravelExplore from "@/components/travel-explore";
import { TravelSearchFilter } from "@/components/travel-search-filters";
import {
  getTravelRecordsByRange,
  getUser,
} from "@travelese/supabase/cached-queries";
import { addWeeks, endOfMonth, formatISO, startOfMonth } from "date-fns";
import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { searchParamsCache } from "./search-params";

export const metadata: Metadata = {
  title: "Travel | Travelese",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const {
    page,
    q: query,
    geo_code,
    iata_code,
    sort,
    start,
    end,
    statuses,
    customers,
  } = searchParamsCache.parse(searchParams);

  const currentDate =
    searchParams?.start ?? formatISO(new Date(), { representation: "date" });

  const [{ data: userData }, { data, meta }] = await Promise.all([
    getUser(),
    getTravelRecordsByRange({
      from: formatISO(startOfMonth(new Date(currentDate)), {
        representation: "date",
      }),
      to: formatISO(endOfMonth(new Date(currentDate)), {
        representation: "date",
      }),
    }),
  ]);

  const loadingKey = JSON.stringify({
    query,
    sort,
    start,
    end,
    statuses,
    customers,
    page,
  });

  return (
    <div>
      {geo_code.latitude && geo_code.longitude ? (
        <TravelExplore />
      ) : (
        <TravelCalendar
          weekStartsOnMonday={userData?.week_starts_on_monday}
          timeFormat={userData?.time_format}
          data={data}
          meta={meta}
        />
      )}

      <div className="mt-14 mb-6 flex items-center justify-between space-x-4">
        <h2 className="text-md font-medium">Bookings</h2>

        <div className="flex space-x-2">
          <TravelSearchFilter />
          <OpenTravelSearchSheet />
          <OpenTravelExploreSheet />
          <OpenTravelChangeSheet />
          <OpenTravelBookSheet />
        </div>
      </div>

      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense fallback={<Loading />} key={loadingKey}>
          <TravelTable
            query={query}
            sort={sort}
            start={start}
            end={end}
            statuses={statuses}
            customers={customers}
            page={page}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
