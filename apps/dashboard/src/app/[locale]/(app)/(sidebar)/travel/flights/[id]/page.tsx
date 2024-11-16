import { FlightActivity } from "@/components/flight-activity-fix";
import { FlightSkeleton } from "@/components/flights-skeleton";
import { PlaneDetails } from "@/components/plane-details";
import { Suspense } from "react";

export default async function Page({ params }) {
  return (
    <>
      <PlaneDetails params={params} />
      <Suspense fallback={<FlightSkeleton />}>
        <FlightActivity params={params} />
      </Suspense>
    </>
  );
}
