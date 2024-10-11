import { ChartSelectors } from "@/components/charts/chart-selectors";
import CreateOfferForm from "@/components/forms/create-offer-form";
import { startOfMonth, startOfYear, subMonths } from "date-fns";
import type { Metadata } from "next";
import { TravelResults } from "./tavel-results";

export const metadata: Metadata = {
  title: "Travel | Travelese",
};

const defaultValue = {
  from: subMonths(startOfMonth(new Date()), 12).toISOString(),
  to: new Date().toISOString(),
  period: "monthly",
};

export default async function Travel() {
  return (
    <>
      <div className="h-[280px] mb-4">
        <ChartSelectors defaultValue={defaultValue} />

        <div className="mt-8 relative">
          <CreateOfferForm />
        </div>
      </div>

      <TravelResults />
    </>
  );
}
