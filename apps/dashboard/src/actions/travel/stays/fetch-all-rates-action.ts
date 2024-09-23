"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { fetchAllRatesSchema } from "../schema";

export const fetchAllRatesAction = authActionClient
  .schema(fetchAllRatesSchema)
  .metadata({
    name: "fetch-all-rates",
    track: {
      event: LogEvents.FetchAllRates.name,
      channel: LogEvents.FetchAllRates.channel,
    },
  })
  .action(async ({ search_result_id }) => {
    try {
      const response =
        await duffel.stays.searchResults.fetchAllRates(search_result_id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch all rates: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
