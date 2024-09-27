import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  location: parseAsString,
  checkInDate: parseAsString,
  checkOutDate: parseAsString,
  guests: parseAsInteger.withDefault(1),
  rooms: parseAsInteger.withDefault(1),
});
