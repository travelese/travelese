"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { addOrderServiceSchema } from "../schema";

export const addOrderServiceAction = authActionClient
  .schema(addOrderServiceSchema)
  .metadata({
    name: "add-order-service",
    track: {
      event: LogEvents.AddOrderService.name,
      channel: LogEvents.AddOrderService.channel,
    },
  })
  .action(async ({ order_id, services }) => {
    try {
      const response = await duffel.orderServices.create(order_id, {
        services,
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
        `Failed to add order service: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
