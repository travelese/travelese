"use server";

import { DuffelError } from "@duffel/api";
import type { Places } from "@duffel/api/Places/Suggestions/SuggestionsType";
import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listPlaceSuggestionsSchema } from "../schema";

export const listPlaceSuggestionsAction = authActionClient
  .schema(listPlaceSuggestionsSchema)
  .metadata({
    name: "list-place-suggestions",
    track: {
      event: LogEvents.ListPlaceSuggestions.name,
      channel: LogEvents.ListPlaceSuggestions.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const { query } = parsedInput;
      const response = await duffel.suggestions.list({
        query,
      });
      return response.data as Places[];
    } catch (error) {
      throw new Error(
        `Failed to list place suggestions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
