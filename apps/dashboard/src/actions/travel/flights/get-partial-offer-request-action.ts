"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { getPartialOfferRequestSchema } from "../schema";

export const getPartialOfferRequestAction = authActionClient
  .schema(getPartialOfferRequestSchema)
  .metadata({
    name: "get-partial-offer-request",
    track: {
      event: LogEvents.GetPartialOfferRequest.name,
      channel: LogEvents.GetPartialOfferRequest.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.partialOfferRequests.get(parsedInput.id);
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
        `Failed to get partial offer request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
