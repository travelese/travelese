"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { searchAccommodationSuggestionsSchema } from "../schema";

export const searchAccommodationSuggestionsAction = authActionClient
  .schema(searchAccommodationSuggestionsSchema)
  .metadata({
    name: "search-accommodation-suggestions",
    track: {
      event: LogEvents.SearchAccommodationSuggestions.name,
      channel: LogEvents.SearchAccommodationSuggestions.channel,
    },
  })
  .action(async ({ query, limit }) => {
    try {
      const response = await duffel.stays.suggestions.list({ query, limit });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to search accommodation suggestions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
