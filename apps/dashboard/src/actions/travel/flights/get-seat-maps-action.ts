"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getSeatMapsSchema } from "../schema";

export const getSeatMapsAction = authActionClient
  .schema(getSeatMapsSchema)
  .metadata({
    name: "get-seat-maps",
    track: {
      event: LogEvents.GetSeatMaps.name,
      channel: LogEvents.GetSeatMaps.channel,
    },
  })
  .action(async ({ offer_id }) => {
    try {
      const response = await duffel.seatMaps.get({ offer_id });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get seat maps: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
