import { logger } from "@/utils/logger";
import { formatISO } from "date-fns";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

// Main controller for which sheet is open
export function useTravelParams() {
  const [params, setParams] = useQueryStates({
    search: parseAsBoolean.withDefault(false), // Controls search sheet
    book: parseAsBoolean.withDefault(false), // Controls book sheet
    change: parseAsBoolean.withDefault(false), // Controls change sheet
    explore: parseAsBoolean.withDefault(false), // Controls explore sheet
    date: parseAsString.withDefault(
      formatISO(new Date(), { representation: "date" }),
    ),
  });

  return {
    ...params,
    setParams,
  };
}

// Explore params
export function useTravelExploreParams() {
  const [params, setParams] = useQueryStates({
    explore: parseAsString,
  });

  return { ...params, setParams };
}

// Search params for both flights and stays
export function useTravelSearchParams() {
  const [params, setParams] = useQueryStates({
    search_type: parseAsString.withDefault("flights"),

    // Flights search params
    travel_type: parseAsString.withDefault("return"),
    cabin_class: parseAsString.withDefault("economy"),
    passengers: parseAsJson<
      Array<{
        type: string;
        given_name?: string;
        family_name?: string;
        age?: number;
      }>
    >().withDefault([{ type: "adult" }]),
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

    // Stays search params
    check_in_date: parseAsString.withDefault(""),
    check_out_date: parseAsString.withDefault(""),
    location: parseAsJson<{
      radius: number;
      geographic_coordinates: {
        longitude: number;
        latitude: number;
      };
    }>().withDefault({
      radius: 5,
      geographic_coordinates: { longitude: 0, latitude: 0 },
    }),
    rooms: parseAsInteger.withDefault(1),
    guests: parseAsJson<
      Array<{
        type: string;
        age?: number;
      }>
    >().withDefault([{ type: "adult" }]),
  });

  return { ...params, setParams };
}

// Booking params for both flights and stays
export function useTravelBookParams() {
  const [params, setParams] = useQueryStates({
    booking_type: parseAsString.withDefault("flights"),

    // Flights booking params
    offer_id: parseAsString,
    passengers:
      parseAsJson<
        Array<{
          type: string;
          title: string;
          given_name: string;
          family_name: string;
          born_on: string;
          email: string;
          phone_number: string;
        }>
      >(),

    // Stays booking params
    accommodation_id: parseAsString,
    rate_id: parseAsString,
    guest_info: parseAsJson<{
      email: string;
      phone_number: string;
      guests: Array<{
        type: string;
        given_name: string;
        family_name: string;
      }>;
    }>(),
  });

  return { ...params, setParams };
}

// Change params (flights change and stays cancel)
export function useTravelChangeParams() {
  const [params, setParams] = useQueryStates({
    change_type: parseAsString.withDefault("flights"),

    // Flights change params
    order_id: parseAsString,
    slices:
      parseAsJson<
        Array<{
          slice_id: string;
          add: boolean;
        }>
      >(),

    // Stays cancel params
    booking_id: parseAsString,
    cancellation_reason: parseAsString.withDefault("customer_request"),
  });

  return {
    ...params,
    setParams,
  };
}
