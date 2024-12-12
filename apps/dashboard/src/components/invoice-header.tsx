import { InvoiceSearchFilter } from "@/components/invoice-search-filter";
import { getTravellers } from "@travelese/supabase/cached-queries";
import { OpenInvoiceSheet } from "./open-invoice-sheet";

export async function InvoiceHeader() {
  const travellers = await getTravellers();

  return (
    <div className="flex items-center justify-between">
      <InvoiceSearchFilter travellers={travellers?.data ?? []} />

      <div className="hidden sm:block">
        <OpenInvoiceSheet />
      </div>
    </div>
  );
}
