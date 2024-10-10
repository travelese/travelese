"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { createBatchOfferRequestSchema } from "../schema";

export const createBatchOfferRequestAction = authActionClient
  .schema(createBatchOfferRequestSchema)
  .metadata({
    name: "create-batch-offer-request",
    track: {
      event: LogEvents.CreateBatchOfferRequest.name,
      channel: LogEvents.CreateBatchOfferRequest.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.batchOfferRequests.create(parsedInput);
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
        `Failed to create batch offer request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
