"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { acceptAirlineInitiatedChangeSchema } from "../schema";

export const acceptAirlineInitiatedChangeAction = authActionClient
  .schema(acceptAirlineInitiatedChangeSchema)
  .metadata({
    name: "accept-airline-initiated-change",
    track: {
      event: LogEvents.AcceptAirlineInitiatedChange.name,
      channel: LogEvents.AcceptAirlineInitiatedChange.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.airlineInitiatedChanges.accept(id);
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
        `Failed to accept airline-initiated change: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
