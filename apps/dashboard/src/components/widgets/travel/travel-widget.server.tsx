import {
  getTrackerRecordsByRange,
  getUser,
} from "@travelese/supabase/cached-queries";
import { endOfMonth, formatISO, startOfMonth } from "date-fns";
import { TravelHeader } from "./travel-header";
import { TravelWidget } from "./travel-widget";

export function TravelWidgetSkeleton() {
  return <TravelHeader />;
}

type Props = {
  date?: string;
};

export async function TravelWidgetServer({ date }: Props) {
  const currentDate = date ?? formatISO(new Date(), { representation: "date" });

  const [{ data: userData }, travelData] = await Promise.all([
    getUser(),
    getTrackerRecordsByRange({
      from: formatISO(startOfMonth(new Date(currentDate)), {
        representation: "date",
      }),
      to: formatISO(endOfMonth(new Date(currentDate)), {
        representation: "date",
      }),
    }),
  ]);

  return (
    <TravelWidget
      data={travelData?.data}
      date={currentDate}
      meta={travelData?.meta}
      weekStartsOnMonday={userData?.week_starts_on_monday}
    />
  );
}
