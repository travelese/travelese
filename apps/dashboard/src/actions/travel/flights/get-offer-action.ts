"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getOfferSchema } from "../schema";

export const getOfferAction = authActionClient
  .schema(getOfferSchema)
  .metadata({
    name: "get-offer",
    track: {
      event: LogEvents.GetOffer.name,
      channel: LogEvents.GetOffer.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.offers.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get offer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
