"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import type { CreateOfferRequest, OfferRequest } from "@duffel/api/types";
import { LogEvents } from "@travelese/events/events";
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
      const response = await duffel.partialOfferRequests.create(
        parsedInput as CreateOfferRequest,
      );

      return response.data as OfferRequest;
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
        `Failed to create partial offer request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
