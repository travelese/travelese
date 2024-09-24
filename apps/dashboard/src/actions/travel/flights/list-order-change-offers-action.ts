"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listOrderChangeOffersSchema } from "../schema";

export const listOrderChangeOffersAction = authActionClient
  .schema(listOrderChangeOffersSchema)
  .metadata({
    name: "list-order-change-offers",
    track: {
      event: LogEvents.ListOrderChangeOffers.name,
      channel: LogEvents.ListOrderChangeOffers.channel,
    },
  })
  .action(async ({ order_change_request_id, limit, after, before }) => {
    try {
      const response = await duffel.orderChangeOffers.list({
        order_change_request_id,
        limit,
        after,
        before,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list order change offers: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
