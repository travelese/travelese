"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
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
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.airlineInitiatedChanges.update(
        parsedInput.id,
        {
          action_taken: parsedInput.action_taken,
        },
      );
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
        `Failed to update airline-initiated change: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
