"use server";

import { authActionClient } from "@/actions/safe-action";
import { exploreTravelSchema } from "@/actions/schema";
import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import type { PassengerType } from "@duffel/api/types";

import { LogEvents } from "@travelese/events/events";
import { client as RedisClient } from "@travelese/kv";
import { nanoid } from "nanoid";

export const searchTravelAction = authActionClient
  .schema(exploreTravelSchema)
  .metadata({
    name: "explore-travel",
    track: {
      event: LogEvents.ExploreTravel.name,
      channel: LogEvents.ExploreTravel.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
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
        `Failed to search travel: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
