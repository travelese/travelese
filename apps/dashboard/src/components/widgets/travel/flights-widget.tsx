import { FlightsList } from "./flights-list";

export async function FlightsWidget() {
  return (
    <div>
      <div className="mt-8 overflow-auto scrollbar-hide pb-32 aspect-square flex flex-col-reverse">
        <FlightsList />
      </div>
    </div>
  );
}
