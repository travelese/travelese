import { InnerFlightActivity } from "./inner-flight";

export async function FlightActivity({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <InnerFlightActivity params={params} />;
}
