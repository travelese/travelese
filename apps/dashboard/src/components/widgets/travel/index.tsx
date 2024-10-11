import { Suspense } from "react";
import { FlightsWidget } from "./flights-widget";

export function Flights() {
  return (
    <div className="border aspect-square overflow-hidden relative flex flex-col p-4 md:p-8">
      <h2 className="text-lg">Flights</h2>
      <Suspense>
        <FlightsWidget />
      </Suspense>
    </div>
  );
}
