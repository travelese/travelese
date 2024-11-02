import { travelAgent } from "@/actions/ai/travel-agent";
import type { MutableAIState } from "@/actions/ai/types";
import { listPlaceSuggestionsAction } from "@/actions/list-place-suggestions-action";
import { searchTravelAction } from "@/actions/search-travel-action";
import { logger } from "@/utils/logger";
import { client as RedisClient } from "@travelese/kv";
import { nanoid } from "nanoid";
import { z } from "zod";
import { TravelUI } from "./ui/travel-ui";

type Args = {
  aiState: MutableAIState;
};

export function searchTravelTool({ aiState }: Args) {
  return {
    description: "Search for Flights or Stays",
    parameters: z.object({
      query: z.string().describe("The user's travel request"),
    }),
    generate: async ({ query }) => {
      const { travel, places, type } = await travelAgent(query);

      const placeSuggestions = await Promise.all(
        places.map(async (place) => {
          const suggestions = await listPlaceSuggestionsAction(place);
          return suggestions?.data ?? [];
        }),
      );

      const searchResults = await searchTravelAction(travel);

      logger("searchResults", searchResults);

      const props = {
        travel,
        type,
        placeSuggestions,
        searchResults,
      };

      const toolCallId = nanoid();

      aiState.done({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            id: nanoid(),
            role: "assistant",
            content: [
              {
                type: "tool-call",
                toolName: "searchTravel",
                toolCallId,
                args: { query },
              },
            ],
          },
          {
            id: nanoid(),
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolName: "searchTravel",
                toolCallId,
                result: props,
              },
            ],
          },
        ],
      });

      return <TravelUI {...props} />;
    },
  };
}
