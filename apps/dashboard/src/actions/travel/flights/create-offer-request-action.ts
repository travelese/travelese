"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import type { CreateOfferRequest, OfferRequest } from "@duffel/api/types";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { createOfferRequestSchema } from "../schema";

export const createOfferRequestAction = authActionClient
  .schema(createOfferRequestSchema)
  .metadata({
    name: "create-offer-request",
    track: {
      event: LogEvents.CreateOfferRequest.name,
      channel: LogEvents.CreateOfferRequest.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const offerRequest: CreateOfferRequest = {
        passengers: parsedInput.parsedInput.passengers,
        slices: parsedInput.parsedInput.slices,
        cabin_class: parsedInput.parsedInput.cabin_class,
        return_offers: parsedInput.parsedInput.return_offers,
        max_connections: parsedInput.parsedInput.max_connections,
        private_fares: parsedInput.parsedInput.private_fares,
      };
      const response = await duffel.offerRequests.create(offerRequest);
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
