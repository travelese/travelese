"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { getOrderChangeSchema } from "../schema";

export const getOrderChangeAction = authActionClient
  .schema(getOrderChangeSchema)
  .metadata({
    name: "get-order-change",
    track: {
      event: LogEvents.GetOrderChange.name,
      channel: LogEvents.GetOrderChange.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.orderChanges.get(parsedInput.id);
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
        `Failed to get order change: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
