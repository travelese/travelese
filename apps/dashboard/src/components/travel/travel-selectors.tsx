import { Cookies } from "@/utils/constants";
import { cookies } from "next/headers";
import { TravelFiltersServer } from "./travel-filters.server";
import { TravelMode } from "./travel-mode";
import { TravelMore } from "./travel-more";
import { TravelPeriod } from "./travel-period";

export async function TravelSelectors({ defaultValue }) {
  const travelMode = cookies().get(Cookies.TravelMode)?.value ?? "flights";

  return (
    <div className="flex justify-between mt-6 space-x-2">
      <div className="flex space-x-2">
        <TravelMode initialValue={travelMode} />
      </div>

      <div className="flex space-x-2">
        <TravelPeriod defaultValue={defaultValue} />
        <TravelFiltersServer />
        <TravelMore defaultValue={defaultValue} mode={travelMode} />
      </div>
    </div>
  );
}
