import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString,
  parseAsJson,
} from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  customers: parseAsArrayOf(parseAsString),
  statuses: parseAsArrayOf(parseAsString),
  sort: parseAsString.withDefault("status:asc"),
  start: parseAsString,
  end: parseAsString,
  geo_code: parseAsJson<{
    latitude: number;
    longitude: number;
  }>(),
  iata_code: parseAsString,
});
