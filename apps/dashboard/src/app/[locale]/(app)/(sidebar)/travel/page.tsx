import CreateOfferForm from "@/components/forms/create-offer-form";
import { TravelSelectors } from "@/components/travel/travel-selectors";
import { Cookies } from "@/utils/constants";
import { startOfMonth, startOfYear, subMonths } from "date-fns";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { TravelResults } from "./tavel-results";

export const metadata: Metadata = {
  title: "Travel | Travelese",
};

const defaultValue = {
  from: subMonths(startOfMonth(new Date()), 12).toISOString(),
  to: new Date().toISOString(),
  period: "weekly",
};

export default async function Travel() {
  const travelType = cookies().get(Cookies.TravelType)?.value ?? "return";

  return (
    <>
      <div className="h-[180px] mb-4">
        <TravelSelectors defaultValue={defaultValue} />

        <div className="mt-8 relative">
          <CreateOfferForm />
        </div>
      </div>

      <TravelResults />
    </>
  );
}
