"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { createOrderChangeSchema } from "../schema";

export const createOrderChangeAction = authActionClient
  .schema(createOrderChangeSchema)
  .metadata({
    name: "create-order-change",
    track: {
      event: LogEvents.CreateOrderChange.name,
      channel: LogEvents.CreateOrderChange.channel,
    },
  })
  .action(async ({ order_id, slices }) => {
    try {
      const response = await duffel.orderChangeRequests.create({
        order_id,
        slices,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create order change request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
