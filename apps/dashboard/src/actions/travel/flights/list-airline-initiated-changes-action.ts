"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listAirlineInitiatedChangesSchema } from "../schema";

export const listAirlineInitiatedChangesAction = authActionClient
  .schema(listAirlineInitiatedChangesSchema)
  .metadata({
    name: "list-airline-initiated-changes",
    track: {
      event: LogEvents.ListAirlineInitiatedChanges.name,
      channel: LogEvents.ListAirlineInitiatedChanges.channel,
    },
  })
  .action(async ({ order_id }) => {
    try {
      const response = await duffel.airlineInitiatedChanges.list({ order_id });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list airline-initiated changes: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
