"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
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
  .action(async ({ offer_id, passenger_id, ...passengerData }) => {
    try {
      const response = await duffel.offerPassengers.update(
        offer_id,
        passenger_id,
        passengerData,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update offer passenger: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
