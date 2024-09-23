"use server";

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
  .action(async ({ query, type, limit }) => {
    try {
      const response = await duffel.places.suggestions.list({
        query,
        type,
        limit,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list place suggestions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
