"use server";

import { authActionClient } from "@/actions/safe-action";
import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import type { Places } from "@duffel/api/Places/Suggestions/SuggestionsType";
import { LogEvents } from "@travelese/events/events";
import { listPlaceSuggestionsSchema } from "./schema";

export const listPlaceSuggestionsAction = authActionClient
  .schema(listPlaceSuggestionsSchema)
  .metadata({
    name: "list-place-suggestions",
    track: {
      event: LogEvents.ListPlaceSuggestions.name,
      channel: LogEvents.ListPlaceSuggestions.channel,
    },
  })
  .action(async ({ parsedInput: { query, rad, lat, lng } }) => {
    try {
      const response = await duffel.suggestions.list({
        query,
        ...(rad && { rad }),
        ...(lat && { lat }),
        ...(lng && { lng }),
      });

      // Log the response from Duffel
      logger("Response from Duffel API:", response.data);

      return response.data as Places[];
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
        `Failed to fetch Places: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  });
