"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
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
  .action(async (input) => {
    try {
      const response = await duffel.batchOfferRequests.create(input);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create batch offer request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
