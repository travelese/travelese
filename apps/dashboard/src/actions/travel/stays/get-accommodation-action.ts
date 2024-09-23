"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getAccommodationSchema } from "../schema";

export const getAccommodationAction = authActionClient
  .schema(getAccommodationSchema)
  .metadata({
    name: "get-accommodation",
    track: {
      event: LogEvents.GetAccommodation.name,
      channel: LogEvents.GetAccommodation.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.stays.accommodations.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get accommodation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
