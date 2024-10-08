"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { listOrdersSchema } from "../schema";

export const listOrdersAction = authActionClient
  .schema(listOrdersSchema)
  .metadata({
    name: "list-orders",
    track: {
      event: LogEvents.ListOrders.name,
      channel: LogEvents.ListOrders.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.orders.list({
        limit: parsedInput.limit,
        after: parsedInput.after,
        before: parsedInput.before,
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
        `Failed to list orders: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
