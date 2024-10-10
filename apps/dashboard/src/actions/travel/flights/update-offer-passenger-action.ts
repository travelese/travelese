"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { updateOfferPassengerSchema } from "../schema";

export const updateOfferPassengerAction = authActionClient
  .schema(updateOfferPassengerSchema)
  .metadata({
    name: "update-offer-passenger",
    track: {
      event: LogEvents.UpdateOfferPassenger.name,
      channel: LogEvents.UpdateOfferPassenger.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.offerPassengers.update(
        parsedInput.offer_id,
        parsedInput.passenger_id,
        parsedInput.passengerData,
      );
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
        `Failed to update offer passenger: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
