"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
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
  .action(async ({ order_id }) => {
    try {
      const response = await duffel.orderAvailableServices.list({ order_id });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list order services: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
