"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { createOrderChangeSchema } from "../schema";

export const createOrderChangeRequestAction = authActionClient
  .schema(createOrderChangeSchema)
  .metadata({
    name: "create-order-change-request",
    track: {
      event: LogEvents.CreateOrderChangeRequest.name,
      channel: LogEvents.CreateOrderChangeRequest.channel,
    },
  })
  .action(async (parsedInput) => {
    try {
      const response = await duffel.orderChangeRequests.create(parsedInput);
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
          `Failed to create order change request: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    }
  });
