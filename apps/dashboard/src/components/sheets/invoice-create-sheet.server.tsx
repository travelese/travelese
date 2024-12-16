import { getDefaultSettings } from "@travelese/invoice/default";
import {
  getInvoiceNumber,
  getInvoiceTemplates,
  getTravellers,
} from "@travelese/supabase/cached-queries";
import { InvoiceCreateSheet } from "./invoice-create-sheet";

export async function InvoiceCreateSheetServer({ teamId }: { teamId: string }) {
  const [{ data: templatesData }, { data: travellersData }, invoiceNumber] =
    await Promise.all([
      getInvoiceTemplates(),
      getTravellers(),
      getInvoiceNumber(),
    ]);

  const defaultSettings = getDefaultSettings();

  // Filter out null values
  const template = templatesData
    ? Object.fromEntries(
      Object.entries(templatesData).filter(([_, value]) => value !== null),
    )
    : {};

  return (
    <InvoiceCreateSheet
      teamId={teamId}
      travellers={travellersData}
      template={template}
      invoiceNumber={invoiceNumber}
      defaultSettings={defaultSettings}
    />
  );
}
