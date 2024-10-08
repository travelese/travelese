"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { createOrderCancellationSchema } from "../schema";

export const createOrderCancellationAction = authActionClient
  .schema(createOrderCancellationSchema)
  .metadata({
    name: "create-order-cancellation",
    track: {
      event: LogEvents.CreateOrderCancellation.name,
      channel: LogEvents.CreateOrderCancellation.channel,
    },
  })
  .action(async ({ order_id }) => {
    try {
      const response = await duffel.orderCancellations.create({ order_id });
      return response.data;
    } catch (error) {
      if (error instanceof DuffelError) {
        logger("Duffel API Error", {
          message: error.message,
          errors: error.errors,
          meta: error.meta,
        });
      } else {
        throw new Error(
          `Failed to create order cancellation: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    }
  });
