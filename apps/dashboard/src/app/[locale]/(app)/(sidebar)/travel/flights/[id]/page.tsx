import { FlightActivity } from '@/app/ui/flight-activity-fix';
import { FlightSkeleton } from '@/app/ui/flights-skeleton';
import { PlaneDetails } from '@/app/ui/plane-details';
import { Suspense } from 'react';

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
