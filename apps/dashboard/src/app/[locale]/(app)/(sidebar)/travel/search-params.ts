import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  q: parseAsString,
  page: parseAsInteger.withDefault(0),
  travel_type: parseAsStringLiteral([
    "one-way",
    "multi-city",
    "nomad",
    "round-trip",
  ] as const),
  passengers: parseAsInteger.withDefault(1),
  cabin_class: parseAsStringLiteral([
    "economy",
    "premium_economy",
    "business",
    "first",
  ] as const),
  max_connections: parseAsInteger.withDefault(0),
  origin: parseAsString,
  destination: parseAsString,
  departure_date: parseAsString,
  return_date: parseAsString,
  requestId: parseAsString,
});
