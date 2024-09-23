"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getOrderCancellationSchema } from "../schema";

export const getOrderCancellationAction = authActionClient
  .schema(getOrderCancellationSchema)
  .metadata({
    name: "get-order-cancellation",
    track: {
      event: LogEvents.GetOrderCancellation.name,
      channel: LogEvents.GetOrderCancellation.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.orderCancellations.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get order cancellation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
