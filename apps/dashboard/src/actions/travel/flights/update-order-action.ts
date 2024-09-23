"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { updateOrderSchema } from "../schema";

export const updateOrderAction = authActionClient
  .schema(updateOrderSchema)
  .metadata({
    name: "update-order",
    track: {
      event: LogEvents.UpdateOrder.name,
      channel: LogEvents.UpdateOrder.channel,
    },
  })
  .action(async ({ id, metadata }) => {
    try {
      const response = await duffel.orders.update(id, { metadata });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
