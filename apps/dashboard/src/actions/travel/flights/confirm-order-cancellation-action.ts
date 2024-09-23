"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { confirmOrderCancellationSchema } from "../schema";

export const confirmOrderCancellationAction = authActionClient
  .schema(confirmOrderCancellationSchema)
  .metadata({
    name: "confirm-order-cancellation",
    track: {
      event: LogEvents.ConfirmOrderCancellation.name,
      channel: LogEvents.ConfirmOrderCancellation.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.orderCancellations.confirm(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to confirm order cancellation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
