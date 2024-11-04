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

      const searchResults = await searchTravelAction({
        ...travel,
        slices: travel.slices?.map((slice, index) => {
          const isReturn = index === 1;
          const originCity = placeSuggestions[isReturn ? 1 : 0]?.find(
            (p) => p.type === "city",
          );
          const destinationCity = placeSuggestions[isReturn ? 0 : 1]?.find(
            (p) => p.type === "city",
          );

          return {
            ...slice,
            origin: originCity?.iata_code ?? slice.origin,
            destination: destinationCity?.iata_code ?? slice.destination,
          };
        }),
      });

      const offersId = searchResults?.data?.offersId;
      //logger("Raw offersId from searchResults", offersId);

      let searchResultsData = {};
      if (offersId) {
        try {
          const redisKey = `offers:${offersId}`;
          // logger("Redis key", redisKey);
          const redisResult = await RedisClient.hgetall(redisKey);
          // logger("Redis raw result", redisResult);

          // Check if redisResult.offers is already an object
          searchResultsData =
            typeof redisResult?.offers === "string"
              ? JSON.parse(redisResult.offers)
              : (redisResult?.offers ?? {});

          // logger("Parsed searchResultsData", searchResultsData);
        } catch (error) {
          // logger("Redis error", error);
          searchResultsData = {};
        }
      }

      // logger("Final searchResultsData", searchResultsData);

      const props = {
        travel,
        type,
        placeSuggestions,
        searchResultsData,
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
