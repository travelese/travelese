"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { createOrderSchema } from "../schema";

export const createOrderAction = authActionClient
  .schema(createOrderSchema)
  .metadata({
    name: "create-order",
    track: {
      event: LogEvents.CreateOrder.name,
      channel: LogEvents.CreateOrder.channel,
    },
  })
  .action(async (input) => {
    try {
      const response = await duffel.orders.create(input);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
