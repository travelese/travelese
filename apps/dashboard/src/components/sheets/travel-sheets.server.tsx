import { Cookies } from "@/utils/constants";
import { getCustomers } from "@travelese/supabase/cached-queries";
import { cookies } from "next/headers";
import { TravelSearchSheet } from "./travel-search-sheet";
import { TravelBookSheet } from "./travel-book-sheet";
import { TravelScheduleSheet } from "./travel-schedule-sheet";
import { TravelChangeSheet } from "./travel-change-sheet";
import { TravelExploreSheet } from "./travel-explore-sheet";

type Props = {
  teamId: string;
  userId: string;
  timeFormat: number;
  defaultCurrency: string;
};

export async function TravelSheetsServer({
  teamId,
  userId,
  timeFormat,
  defaultCurrency,
}: Props) {
  const { data: customers } = await getCustomers();

  const projectId = cookies().get(Cookies.LastProject)?.value;

  return (
    <>
      <TravelSearchSheet
        teamId={teamId}
        userId={userId}
        customers={customers}
      />

      <TravelScheduleSheet
        teamId={teamId}
        userId={userId}
        timeFormat={timeFormat}
        lastBookingId={bookingId}
      />

      <TravelBookSheet
        teamId={teamId}
        userId={userId}
        customers={customers}
        currencyCode={defaultCurrency}
      />

      <TravelChangeSheet
        teamId={teamId}
        userId={userId}
        customers={customers}
        currencyCode={defaultCurrency}
      />

      <TravelExploreSheet
        currencyCode={defaultCurrency}
        customers={customers}
      />

    </>
  );
}
