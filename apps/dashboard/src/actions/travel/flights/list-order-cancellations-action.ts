"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
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
  .action(async ({ order_id, limit, after, before }) => {
    try {
      const response = await duffel.orderCancellations.list({
        order_id,
        limit,
        after,
        before,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list order cancellations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
