"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listOrdersSchema } from "../schema";

export const listOrdersAction = authActionClient
  .schema(listOrdersSchema)
  .metadata({
    name: "list-orders",
    track: {
      event: LogEvents.ListOrders.name,
      channel: LogEvents.ListOrders.channel,
    },
  })
  .action(async (params) => {
    try {
      const response = await duffel.orders.list(params);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list orders: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
