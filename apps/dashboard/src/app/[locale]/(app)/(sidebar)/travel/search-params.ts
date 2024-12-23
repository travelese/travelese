import {
  createSearchParamsCache,
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsJson,
} from "nuqs/server";
import { formatISO } from "date-fns";

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(0),
  statuses: parseAsString.withDefault(""),
  customers: parseAsArrayOf(parseAsString),
  sort: parseAsString.withDefault("status:asc"),
  q: parseAsString.withDefault(""),
  start: parseAsString,
  end: parseAsString,
  geo_code: parseAsJson<{
    latitude: number;
    longitude: number;
  }>().withDefault({
    latitude: 0,
    longitude: 0,
  }),
  iata_code: parseAsString.withDefault(""),
});
