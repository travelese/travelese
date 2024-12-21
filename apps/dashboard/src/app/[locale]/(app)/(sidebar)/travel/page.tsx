import {
  OpenTravelBookSheet,
  OpenTravelChangeSheet,
  OpenTravelExploreSheet,
  OpenTravelSearchSheet,
} from "@/components/open-travel-sheet";
import { Table } from "@/components/tables/travel";
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
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Travel | Travelese",
};

type Props = {
  searchParams: {
    statuses: string;
    sort: string;
    q: string;
    start?: string;
    end?: string;
    geocode?: string;
  };
};

export default async function Travel({ searchParams }: Props) {
  const status = searchParams?.statuses;
  const sort = searchParams?.sort?.split(":") ?? ["status", "asc"];
  const geocode = searchParams?.geocode
    ? JSON.parse(searchParams.geocode)
    : null;

  const currentDate =
    searchParams?.date ?? formatISO(new Date(), { representation: "date" });

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

  return (
    <div>
      {geocode ? (
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

      <Suspense key={status} fallback={<Loading />}>
        <Table
          status={status}
          sort={sort}
          q={searchParams?.q}
          start={searchParams?.start}
          end={searchParams?.end}
          userId={userData?.id}
        />
      </Suspense>
    </div>
  );
}
