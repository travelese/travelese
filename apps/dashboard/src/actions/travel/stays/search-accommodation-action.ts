"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { searchAccommodationSchema } from "../schema";

export const searchAccommodationAction = authActionClient
  .schema(searchAccommodationSchema)
  .metadata({
    name: "search-accommodation",
    track: {
      event: LogEvents.SearchAccommodation.name,
      channel: LogEvents.SearchAccommodation.channel,
    },
  })
  .action(async (params) => {
    try {
      const response = await duffel.stays.search(params);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to search accommodation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
