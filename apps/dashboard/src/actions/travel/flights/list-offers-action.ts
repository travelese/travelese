"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listOffersSchema } from "../schema";

export const listOffersAction = authActionClient
  .schema(listOffersSchema)
  .metadata({
    name: "list-offers",
    track: {
      event: LogEvents.ListOffers.name,
      channel: LogEvents.ListOffers.channel,
    },
  })
  .action(async ({ offer_request_id, limit, after, before }) => {
    try {
      const response = await duffel.offers.list({
        offer_request_id,
        limit,
        after,
        before,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list offers: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
