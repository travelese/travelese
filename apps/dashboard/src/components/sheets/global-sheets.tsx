import { Cookies } from "@/utils/constants";
import { getUser } from "@travelese/supabase/cached-queries";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { CustomerCreateSheet } from "./customer-create-sheet";
import { CustomerEditSheet } from "./customer-edit-sheet";
import { InvoiceCommentsSheet } from "./invoice-comments";
import { InvoiceCreateSheetServer } from "./invoice-create-sheet.server";
import { TravelExploreSheet } from "./travel-explore-sheet";
import { TravelSearchSheet } from "./travel-search-sheet";
import { TravelBookSheet } from "./travel-book-sheet";
import { TravelChangeSheet } from "./travel-change-sheet";

type Props = {
  defaultCurrency: string;
};

export async function GlobalSheets({ defaultCurrency }: Props) {
  const { data: userData } = await getUser();
  const bookingId = cookies().get(Cookies.LastBooking)?.value;

  return (
    <>
      <TravelExploreSheet userId={userData?.id} currency={defaultCurrency} />
      <TravelSearchSheet userId={userData?.id} currency={defaultCurrency} />

      <TravelBookSheet userId={userData?.id} currency={defaultCurrency} />
      <TravelChangeSheet userId={userData?.id} currency={defaultCurrency} />

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
