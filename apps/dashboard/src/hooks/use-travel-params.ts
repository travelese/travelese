import { logger } from "@/utils/logger";
import { formatISO } from "date-fns";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

export function useTravelParams(initialDate?: string) {
  const [params, setParams] = useQueryStates({
    date: parseAsString.withDefault(
      initialDate ?? formatISO(new Date(), { representation: "date" }),
    ),
    create: parseAsBoolean,
    bookingId: parseAsString,
    update: parseAsBoolean,
    selectedDate: parseAsString,
    range: parseAsArrayOf(parseAsString),
    statuses: parseAsArrayOf(
      parseAsStringLiteral(["completed", "in_progress"]),
    ),
    start: parseAsString,
    end: parseAsString,
  });

  return {
    ...params,
    setParams,
  };
}

export function useTravelSearchParams() {
  const [params, setParams] = useQueryStates({
    travel_type: parseAsString.withDefault("return"),
    cabin_class: parseAsString.withDefault("economy"),
    passengers: parseAsJson<Array<{ type: string }>>().withDefault([
      { type: "adult" },
    ]),
    slices: parseAsJson<
      Array<{
        origin: string;
        destination: string;
        departure_date: string;
      }>
    >().withDefault([
      { origin: "", destination: "", departure_date: "" },
      { origin: "", destination: "", departure_date: "" },
    ]),
    bags: parseAsJson<{
      carry_on: number;
      cabin: number;
      checked: number;
    }>().withDefault({ carry_on: 0, cabin: 0, checked: 0 }),
    offer_request_id: parseAsString,
  });

  return {
    ...params,
    setParams,
  };
}
