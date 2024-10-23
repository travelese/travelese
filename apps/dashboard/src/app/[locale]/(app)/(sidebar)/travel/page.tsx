import { TravelSearchCard } from "@/components/cards/search-travel-card";
import { TravelResults } from "@/components/travel/travel-results";
import { TravelSelectors } from "@/components/travel/travel-selectors";
import { addWeeks } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel | Travelese",
};

const defaultValue = {
  from: new Date().toISOString(),
  to: addWeeks(new Date(), 1).toISOString(),
  period: "weekly",
};

export default async function Travel() {
  return (
    <>
      <div>
        <div className="h-[530px] mb-4">
          <TravelSelectors defaultValue={defaultValue} />

          <div className="mt-8 relative">
            <TravelSearchCard />
          </div>
        </div>
      </div>

      <TravelResults />
    </>
  );
}
