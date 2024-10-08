"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { listOrderCancellationsSchema } from "../schema";

export const listOrderCancellationsAction = authActionClient
  .schema(listOrderCancellationsSchema)
  .metadata({
    name: "list-order-cancellations",
    track: {
      event: LogEvents.ListOrderCancellations.name,
      channel: LogEvents.ListOrderCancellations.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.orderCancellations.list({
        order_id: parsedInput.order_id,
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
        `Failed to list order cancellations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
