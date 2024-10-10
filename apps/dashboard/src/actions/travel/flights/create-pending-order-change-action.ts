"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
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
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.orderChanges.create({
        selected_order_change_offer: parsedInput.selected_order_change_offer,
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
        throw new Error(
          `Failed to create pending order change: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    }
  });
