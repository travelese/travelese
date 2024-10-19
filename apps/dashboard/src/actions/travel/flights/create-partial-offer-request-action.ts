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
      const offerRequest: CreateOfferRequest = {
        slices: parsedInput.slices.map((slice) => ({
          origin: slice.origin,
          destination: slice.destination,
          departure_date: slice.departure_date,
          departure_time: slice.departure_time,
          arrival_time: slice.arrival_time,
        })),
        passengers: parsedInput.passengers.map((passenger) => ({
          type: passenger.type,
          loyalty_programme_accounts: passenger.loyalty_programme_accounts,
        })),
        cabin_class: parsedInput.cabin_class,
        return_offers: parsedInput.return_offers,
        max_connections: parsedInput.max_connections ?? 0,
        private_fares: parsedInput.private_fares ?? {},
      };

      const response = await duffel.partialOfferRequests.create(offerRequest);
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
