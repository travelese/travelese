"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { createPendingOrderChangeSchema } from "../schema";

export const createPendingOrderChangeAction = authActionClient
  .schema(createPendingOrderChangeSchema)
  .metadata({
    name: "create-pending-order-change",
    track: {
      event: LogEvents.CreatePendingOrderChange.name,
      channel: LogEvents.CreatePendingOrderChange.channel,
    },
  })
  .action(async ({ selected_order_change_offer }) => {
    try {
      const response = await duffel.orderChanges.create({
        selected_order_change_offer,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create pending order change: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
