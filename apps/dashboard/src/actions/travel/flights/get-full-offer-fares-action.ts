"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getFullOfferFaresSchema } from "../schema";

export const getFullOfferFaresAction = authActionClient
  .schema(getFullOfferFaresSchema)
  .metadata({
    name: "get-full-offer-fares",
    track: {
      event: LogEvents.GetFullOfferFares.name,
      channel: LogEvents.GetFullOfferFares.channel,
    },
  })
  .action(async ({ id, selected_partial_offer_ids }) => {
    try {
      const response = await duffel.partialOfferRequests.getFares(id, {
        selected_partial_offer_ids,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get full offer fares: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
