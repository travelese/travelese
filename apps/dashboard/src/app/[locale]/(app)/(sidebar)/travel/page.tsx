import { ErrorFallback } from "@/components/error-fallback";
import {
  OpenTravelBookSheet,
  OpenTravelChangeSheet,
  OpenTravelExploreSheet,
} from "@/components/open-travel-sheet";
import { Table } from "@/components/tables/travel";
import { Loading } from "@/components/tables/travel/loading";
import { TravelSearch } from "@/components/travel/travel-search";
import { TravelSearchFilter } from "@/components/travel/travel-search-filters";
import {
  getTravelRecordsByRange,
  getUser,
} from "@travelese/supabase/cached-queries";
import { endOfMonth, formatISO, startOfMonth } from "date-fns";
import type { Metadata } from "next";
import { Suspense } from "react";
import { searchParamsCache } from "./search-params";

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
    customers?: string[];
    geo_code: {
      latitude: number;
      longitude: number;
    },
    iata_code: string;
  };
};

export default async function Travel({ searchParams }: Props) {
  const {
    sort: sortParams,
    statuses,
    customers,
  } = searchParamsCache.parse(searchParams);  

  const sort = sortParams?.split(":") ?? ["status", "asc"];

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

  const geo_code = searchParams?.geo_code ?? { latitude: 0, longitude: 0 };

  return (
    <div>
      {/* {geo_code.latitude !== 0 && geo_code.longitude !== 0 ? (
        <TravelExplore />
      ) : (
        <TravelCalendar
          weekStartsOnMonday={userData?.week_starts_on_monday}
          timeFormat={userData?.time_format}
          data={data}
          meta={meta}
        />
      )} */}

      <TravelSearch 
        userData={userData} 
        data={data} 
        meta={meta} 
      />

      <div className="mt-14 mb-6 flex items-center justify-between space-x-4">
        <h2 className="text-md font-medium">Bookings</h2>

        <div className="flex space-x-2">
          <TravelSearchFilter />
          <OpenTravelExploreSheet />
          <OpenTravelChangeSheet />
          <OpenTravelBookSheet />
        </div>
      </div>

      <Suspense fallback={<Loading />}>
        <Table
          status={statuses}
          sort={sort}
          q={searchParams?.q}
          start={searchParams?.start}
          end={searchParams?.end}
          userId={userData?.id}
          customerIds={customers}
        />
      </Suspense>
    </div>
  );
}

