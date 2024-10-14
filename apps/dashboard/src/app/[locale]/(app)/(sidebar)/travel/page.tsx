import CreateOfferForm from "@/components/forms/create-offer-form";
import { TravelSelectors } from "@/components/travel/travel-selectors";
import { Cookies } from "@/utils/constants";
import { addWeeks } from "date-fns";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { TravelResults } from "./tavel-results";

export const metadata: Metadata = {
  title: "Travel | Travelese",
};

const defaultValue = {
  from: new Date().toISOString(),
  to: addWeeks(new Date(), 1).toISOString(),
  period: "weekly",
};

export default async function Travel({ searchParams }) {
  const travelType = cookies().get(Cookies.TravelType)?.value ?? "return";

  const initialPeriod = cookies().has(Cookies.TravelPeriod)
    ? JSON.parse(cookies().get(Cookies.TravelPeriod)?.value ?? "trip")
    : {
        id: "this_week",
        from: new Date().toISOString(),
        to: addWeeks(new Date(), 1).toISOString(),
      };

  const value = {
    ...(searchParams.from && { from: searchParams.from }),
    ...(searchParams.to && { to: searchParams.to }),
  };

  return (
    <>
      <div>
        <div className="h-[180px] mb-4">
          <TravelSelectors defaultValue={defaultValue} />

          <div className="mt-8 relative">
            <CreateOfferForm />
          </div>
        </div>
      </div>

      <TravelResults />
    </>
  );
}
