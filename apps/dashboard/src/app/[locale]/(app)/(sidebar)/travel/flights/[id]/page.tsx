import { FlightActivity } from "@/components/travel/flight-activity-fix";
import { FlightSkeleton } from "@/components/travel/flights-skeleton";
import { PlaneDetails } from "@/components//travel/plane-details";
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
