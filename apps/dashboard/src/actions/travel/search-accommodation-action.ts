"use server";

import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../utils/duffel";
import { authActionClient } from "../safe-action";
import { searchAccommodationSchema } from "./schema";

export const searchAccommodationAction = authActionClient
  .schema(searchAccommodationSchema)
  .metadata({
    name: "search-accommodation",
    track: {
      event: LogEvents.SearchAccommodation.name,
      channel: LogEvents.SearchAccommodation.channel,
    },
  })
  .action(
    async ({
      parsedInput: { check_in_date, check_out_date, guests, location, rooms },
    }) => {
      try {
        const response = await duffel.stays.search({
          check_in_date,
          check_out_date,
          guests,
          location,
          rooms,
        });

        return {
          ...response.data,
        };
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
          `Failed to list offers: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    },
  );
