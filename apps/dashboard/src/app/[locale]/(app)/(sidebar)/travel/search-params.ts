import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  origin: parseAsString,
  destination: parseAsString,
  departureDate: parseAsString,
  returnDate: parseAsString.withDefault(""),
  passengers: parseAsString.withDefault("1"),
  cabinClass: parseAsString.withDefault("economy"),
});
