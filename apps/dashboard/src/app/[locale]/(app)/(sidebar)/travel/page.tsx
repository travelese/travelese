import SearchFlightsForm from "@/components/forms/search-flights-form";
import { TravelSelectors } from "@/components/travel/travel-selectors";
import { Cookies } from "@/utils/constants";
import { addWeeks } from "date-fns";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { TravelResults } from "./tavel-results";

export const metadata: Metadata = {
  title: "Travel | Travelese",
};

// const defaultValue = {
//   from: new Date().toISOString(),
//   to: addWeeks(new Date(), 1).toISOString(),
//   period: "weekly",
// };

export default async function Travel() {
  return (
    <>
      <div>
        <div className="h-[530px] mb-4">
          {/* <TravelSelectors defaultValue={defaultValue} /> */}

          <div className="mt-8 relative p-6 bg-background border-border shadow-sm items-center justify-center">
            <SearchFlightsForm />
          </div>
        </div>
      </div>

      <TravelResults />
    </>
  );
}
