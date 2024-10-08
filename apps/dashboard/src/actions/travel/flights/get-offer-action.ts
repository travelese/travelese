"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { getOfferSchema } from "../schema";

export const getOfferAction = authActionClient
  .schema(getOfferSchema)
  .metadata({
    name: "get-offer",
    track: {
      event: LogEvents.GetOffer.name,
      channel: LogEvents.GetOffer.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.offers.get(id);
      return response.data;
    } catch (error) {
      if (error instanceof DuffelError) {
        logger("Duffel API Error", {
          message: error.message,
          errors: error.errors,
          meta: error.meta,
        });
      } else {
        throw new Error(
          `Failed to get offer: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    }
  });
