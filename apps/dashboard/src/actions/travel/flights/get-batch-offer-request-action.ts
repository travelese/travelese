"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getBatchOfferRequestSchema } from "../schema";

export const getBatchOfferRequestAction = authActionClient
  .schema(getBatchOfferRequestSchema)
  .metadata({
    name: "get-batch-offer-request",
    track: {
      event: LogEvents.GetBatchOfferRequest.name,
      channel: LogEvents.GetBatchOfferRequest.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.batchOfferRequests.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get batch offer request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
