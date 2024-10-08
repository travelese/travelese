"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
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
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.seatMaps.get({
        offer_id: parsedInput.offer_id,
      });
      return response.data;
    } catch (error) {
      if (error instanceof DuffelError) {
        logger("Duffel API Error", {
          message: error.message,
          errors: error.errors,
          meta: error.meta,
        });
      } else {
        logger("Unexpected Error", error);
      }
      throw new Error(
        `Failed to get seat maps: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
