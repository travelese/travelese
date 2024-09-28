"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { createPartialOfferRequestSchema } from "../schema";

export const createPartialOfferRequestAction = authActionClient
  .schema(createPartialOfferRequestSchema)
  .metadata({
    name: "create-partial-offer-request",
    track: {
      event: LogEvents.CreatePartialOfferRequest.name,
      channel: LogEvents.CreatePartialOfferRequest.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.partialOfferRequests.create({
        ...parsedInput,
      });

      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create partial offer request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
