"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { getOfferRequestSchema } from "../schema";

export const getOfferRequestAction = authActionClient
  .schema(getOfferRequestSchema)
  .metadata({
    name: "get-offer-request",
    track: {
      event: LogEvents.GetOfferRequest.name,
      channel: LogEvents.GetOfferRequest.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.offerRequests.get(parsedInput.id);
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
          `Failed to get offer request: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    }
  });
