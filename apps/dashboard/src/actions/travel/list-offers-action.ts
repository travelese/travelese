"use server";

import { authActionClient } from "@/actions/safe-action";
import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { listOffersSchema } from "./schema";

export const listOffersAction = authActionClient
  .schema(listOffersSchema)
  .metadata({
    name: "list-offers",
    track: {
      event: LogEvents.ListOffers.name,
      channel: LogEvents.ListOffers.channel,
    },
  })
  .action(async ({ offer_request_id, limit, after, before }) => {
    try {
      const response = await duffel.offers.list({
        offer_request_id,
        limit,
        after,
        before,
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
        `Failed to list offers: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
