import { Cookies } from "@/utils/constants";
import { cookies } from "next/headers";
import { TravelCabin } from "./travel-cabin";
import { TravelFiltersServer } from "./travel-filters.server";
import { TravelLuggage } from "./travel-luggage";
import { TravelMore } from "./travel-more";
import { TravelPassenger } from "./travel-passenger";
import { TravelPeriod } from "./travel-period";
import { TravelType } from "./travel-type";

export async function TravelSelectors({ defaultValue }) {
  const travelType = cookies().get(Cookies.TravelType)?.value ?? "return";
  const travelCabin = cookies().get(Cookies.TravelCabin)?.value ?? "economy";
  const travelPassenger =
    cookies().get(Cookies.TravelPassenger)?.value ?? "adult";
  const travelLuggage = cookies().get(Cookies.TravelLuggage)?.value ?? "cabin";

  return (
    <div className="flex justify-between mt-6 space-x-2">
      <div className="flex space-x-2 w-1/2">
        <TravelType initialValue={travelType} />
        <TravelCabin initialValue={travelCabin} />
        <TravelPassenger initialValue={travelPassenger} />
        <TravelLuggage initialValue={travelLuggage} />
      </div>

      <div className="flex space-x-2">
        <TravelPeriod defaultValue={defaultValue} />
        <TravelFiltersServer />
        <TravelMore defaultValue={defaultValue} type={travelType} />
      </div>
    </div>
  );
}
