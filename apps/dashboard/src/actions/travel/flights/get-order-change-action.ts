"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getOrderChangeSchema } from "../schema";

export const getOrderChangeAction = authActionClient
  .schema(getOrderChangeSchema)
  .metadata({
    name: "get-order-change",
    track: {
      event: LogEvents.GetOrderChange.name,
      channel: LogEvents.GetOrderChange.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.orderChanges.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get order change: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
