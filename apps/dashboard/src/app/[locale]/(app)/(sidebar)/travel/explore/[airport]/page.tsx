import { Map } from "@/components/map";
import { Planes } from "@/components/planes";
import { getFlights } from "@/utils/get-flights";

export default async function Page({ params }) {
  const flights = await getFlights(params);

  return (
    <Map params={params}>
      <Planes color="blue" flights={flights} />
    </Map>
  );
}
