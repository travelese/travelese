"use server";

import { authActionClient } from "@/actions/safe-action";
import { duffel } from "@/utils/duffel";
import type { CreateOfferRequest, OfferRequest } from "@duffel/api/types";
import { LogEvents } from "@travelese/events/events";
import { createOfferRequestSchema } from "./schema";
import { DuffelError } from "@duffel/api";
import { logger } from "@/utils/logger";

export const createOfferRequestAction = authActionClient
  .schema(createOfferRequestSchema)
  .metadata({
    name: "create-offer-request",
    track: {
      event: LogEvents.CreateOfferRequest.name,
      channel: LogEvents.CreateOfferRequest.channel,
    },
  })
  .action(
    async ({
      parsedInput: {
        slices,
        passengers,
        cabin_class,
        return_offers,
        max_connections,
        private_fares,
      },
    }) => {
      try {
        const response = await duffel.offerRequests.create({
          slices,
          passengers,
          cabin_class,
          return_offers,
          ...(max_connections && { max_connections }),
          ...(private_fares && { private_fares }),
        });

        // Log the response from Duffel
        logger("Response from Duffel API:", response.data);

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
          `Failed to create OfferRequest: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });
