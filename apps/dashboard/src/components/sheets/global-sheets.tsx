import { Cookies } from "@/utils/constants";
import { getUser } from "@travelese/supabase/cached-queries";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { TravellerCreateSheet } from "./traveller-create-sheet";
import { TravellerEditSheet } from "./traveller-edit-sheet";
import { InvoiceCommentsSheet } from "./invoice-comments";
import { InvoiceCreateSheetServer } from "./invoice-create-sheet.server";
import { BookTravelSheet } from "./travel-book-sheet";
import { ChangeTravelSheet } from "./travel-change-sheet";
import { ExploreTravelSheet } from "./travel-explore-sheet";
import { SearchTravelSheet } from "./travel-search-sheet";

type Props = {
  defaultCurrency: string;
};

export async function GlobalSheets({ defaultCurrency }: Props) {
  const { data: userData } = await getUser();
  const bookingId = cookies().get(Cookies.LastBooking)?.value;

  return (
    <>
      <SearchTravelSheet userId={userData?.id} currency={defaultCurrency} />
      <ExploreTravelSheet userId={userData?.id} currency={defaultCurrency} />
      <BookTravelSheet userId={userData?.id} currency={defaultCurrency} />
      <ChangeTravelSheet userId={userData?.id} currency={defaultCurrency} />

      <TravellerCreateSheet />
      <TravellerEditSheet />
      <InvoiceCommentsSheet />
      <Suspense fallback={null}>
        {/* We preload the invoice data (template, invoice number etc) */}
        <InvoiceCreateSheetServer teamId={userData?.team_id} />
      </Suspense>
    </>
  );
}
