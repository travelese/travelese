"use client";

import { FlightActivity } from "@/components/flight-activity-fix";
import { FlightSkeleton } from "@/components/flights-skeleton";
import { PlaneDetails } from "@/components/plane-details";
import { Suspense } from "react";

type Props = {
  params: {
    explore: string;
  };
};

export default function TravelExplore({ params }: Props) {
  return (
    <>
      <PlaneDetails params={params} />
      <Suspense fallback={<FlightSkeleton />}>
        <FlightActivity params={params} />
      </Suspense>
    </>
  );
}
