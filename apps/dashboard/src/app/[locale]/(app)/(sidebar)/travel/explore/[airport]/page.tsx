import { Map } from '@/app/ui/map';
import { Planes } from '@/app/ui/planes';
import { getFlights } from '@/app/utils/get-flights';

export default async function Page({ params }) {
  const flights = await getFlights(params);

  return (
    <Map params={params}>
      <Planes color="blue" flights={flights} />
    </Map>
  );
}
