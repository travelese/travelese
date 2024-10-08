"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
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
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.orders.get(parsedInput.id);
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
        `Failed to get order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
