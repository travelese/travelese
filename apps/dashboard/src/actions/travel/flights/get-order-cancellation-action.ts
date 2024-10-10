"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
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
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.orderCancellations.get(parsedInput.id);
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
        `Failed to get order cancellation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
