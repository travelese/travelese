"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { confirmOrderChangeSchema } from "../schema";

export const confirmOrderChangeAction = authActionClient
  .schema(confirmOrderChangeSchema)
  .metadata({
    name: "confirm-order-change",
    track: {
      event: LogEvents.ConfirmOrderChange.name,
      channel: LogEvents.ConfirmOrderChange.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.orderChanges.confirm(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to confirm order change: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
