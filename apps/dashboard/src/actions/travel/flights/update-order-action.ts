"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
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
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.orders.update(parsedInput.id, {
        metadata: parsedInput.metadata,
      });
      return response.data;
    } catch (error) {
      if (error instanceof DuffelError) {
        logger("Duffel API Error", {
          message: error.message,
          errors: error.errors,
          meta: error.meta,
        });
      } else {
        logger("Unexpected Error", error);
      }
      throw new Error(
        `Failed to update order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
