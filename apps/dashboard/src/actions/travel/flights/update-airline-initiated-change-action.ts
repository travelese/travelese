"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { updateAirlineInitiatedChangeSchema } from "../schema";

export const updateAirlineInitiatedChangeAction = authActionClient
  .schema(updateAirlineInitiatedChangeSchema)
  .metadata({
    name: "update-airline-initiated-change",
    track: {
      event: LogEvents.UpdateAirlineInitiatedChange.name,
      channel: LogEvents.UpdateAirlineInitiatedChange.channel,
    },
  })
  .action(async ({ id, metadata }) => {
    try {
      const response = await duffel.airlineInitiatedChanges.update(id, {
        metadata,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update airline-initiated change: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
