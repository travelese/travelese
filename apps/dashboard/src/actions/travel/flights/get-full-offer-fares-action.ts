"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { getFullOfferFaresSchema } from "../schema";

export const getFullOfferFaresAction = authActionClient
  .schema(getFullOfferFaresSchema)
  .metadata({
    name: "get-full-offer-fares",
    track: {
      event: LogEvents.GetFullOfferFares.name,
      channel: LogEvents.GetFullOfferFares.channel,
    },
  })
  .action(async ({ id, selected_partial_offer_ids }) => {
    try {
      const response = await duffel.partialOfferRequests.getFares(id, {
        selected_partial_offer_ids,
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
        throw new Error(
          `Failed to get full offer fares: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    }
  });
