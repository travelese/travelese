"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
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
  .action(async ({ id }) => {
    try {
      const response = await duffel.partialOfferRequests.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get partial offer request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
