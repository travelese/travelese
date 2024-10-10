"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
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
      if (error instanceof DuffelError) {
        logger("Duffel API Error", {
          message: error.message,
          errors: error.errors,
          meta: error.meta,
        });
      } else {
        throw new Error(
          `Failed to create order: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    }
  });
