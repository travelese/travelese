import { InnerFlightActivity } from "./inner-flight";
import { MeasureScreen } from "./measure-screen";

export async function FlightActivity({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <InnerFlightActivity params={params}>
      <MeasureScreen />
    </InnerFlightActivity>
  );
}
