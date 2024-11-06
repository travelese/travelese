import { Cookies } from "@/utils/constants";
import { getUser } from "@travelese/supabase/cached-queries";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { CustomerCreateSheet } from "./customer-create-sheet";
import { CustomerEditSheet } from "./customer-edit-sheet";
import { InvoiceCommentsSheet } from "./invoice-comments";
import { InvoiceCreateSheetServer } from "./invoice-create-sheet.server";
import { TrackerCreateSheet } from "./tracker-create-sheet";
import { TrackerScheduleSheet } from "./tracker-schedule-sheet";
import { TrackerUpdateSheet } from "./tracker-update-sheet";
import { BookTravelSheet } from "./travel-book-sheet";
import { ChangeTravelSheet } from "./travel-change-sheet";
import { SearchTravelSheet } from "./travel-search-sheet";

type Props = {
  defaultCurrency: string;
};

export async function GlobalSheets({ defaultCurrency }: Props) {
  const { data: userData } = await getUser();
  const projectId = cookies().get(Cookies.LastProject)?.value;
  const bookingId = cookies().get(Cookies.LastBooking)?.value;

  return (
    <>
      <TrackerUpdateSheet teamId={userData?.team_id} userId={userData?.id} />
      <TrackerCreateSheet
        currencyCode={defaultCurrency}
        teamId={userData?.team_id}
      />
      <TrackerScheduleSheet
        teamId={userData?.team_id}
        userId={userData?.id}
        timeFormat={userData?.time_format}
        lastProjectId={projectId}
      />
      <SearchTravelSheet userId={userData?.id} currency={defaultCurrency} />
      <BookTravelSheet userId={userData?.id} currency={defaultCurrency} />
      <ChangeTravelSheet userId={userData?.id} currency={defaultCurrency} />

      <CustomerCreateSheet />
      <CustomerEditSheet />
      <InvoiceCommentsSheet />
      <Suspense fallback={null}>
        {/* We preload the invoice data (template, invoice number etc) */}
        <InvoiceCreateSheetServer teamId={userData?.team_id} />
      </Suspense>
    </>
  );
}
