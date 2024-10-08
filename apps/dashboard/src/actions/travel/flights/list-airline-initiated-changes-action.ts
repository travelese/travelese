"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
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
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.airlineInitiatedChanges.list({
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
        `Failed to list airline-initiated changes: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
