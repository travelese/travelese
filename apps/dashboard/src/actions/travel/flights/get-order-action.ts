"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getOrderSchema } from "../schema";

export const getOrderAction = authActionClient
  .schema(getOrderSchema)
  .metadata({
    name: "get-order",
    track: {
      event: LogEvents.GetOrder.name,
      channel: LogEvents.GetOrder.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.orders.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
