"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { listOrderServicesSchema } from "../schema";

export const listOrderServicesAction = authActionClient
  .schema(listOrderServicesSchema)
  .metadata({
    name: "list-order-services",
    track: {
      event: LogEvents.ListOrderServices.name,
      channel: LogEvents.ListOrderServices.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.orderAvailableServices.list({
        order_id: parsedInput.order_id,
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
        `Failed to list order services: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
