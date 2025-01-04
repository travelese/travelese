import { travelAgent } from "@/actions/ai/travel-agent";
import type { MutableAIState } from "@/actions/ai/types";
import { listPlaceSuggestionsAction } from "@/actions/travel/list-place-suggestions-action";
import { searchTravelAction } from "@/actions/travel/search-travel-action";
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

      // When retrieving the data
      let searchResultsData = {};
      if (type === "flights" && searchResults?.data?.offersId) {
        try {
          const redisKey = `offers:${searchResults.data.offersId}`;
          const redisResult = await RedisClient.hgetall(redisKey);

          if (!redisResult?.offers) {
            throw new Error("Flight offers data not found or expired");
          }

          // Add safety checks for parsing
          try {
            searchResultsData =
              typeof redisResult.offers === "string"
                ? JSON.parse(redisResult.offers)
                : redisResult.offers;
          } catch (parseError) {
            logger("Failed to parse flight results", {
              error: parseError,
              data: redisResult.offers,
            });
            throw new Error("Invalid flight data format");
          }
        } catch (error) {
          logger("Failed to retrieve flight results", error);
          throw new Error(
            "Failed to retrieve flight results. Please try again.",
          );
        }
      } else if (type === "stays" && searchResults?.data?.accommodationsId) {
        // Same pattern for accommodations
        try {
          const redisKey = `accommodations:${searchResults.data.accommodationsId}`;
          const redisResult = await RedisClient.hgetall(redisKey);

          if (!redisResult?.accommodations) {
            throw new Error("Accommodation data not found or expired");
          }

          try {
            searchResultsData =
              typeof redisResult.accommodations === "string"
                ? JSON.parse(redisResult.accommodations)
                : redisResult.accommodations;
          } catch (parseError) {
            logger("Failed to parse accommodation results", {
              error: parseError,
              data: redisResult.accommodations,
            });
            throw new Error("Invalid accommodation data format");
          }
        } catch (error) {
          logger("Failed to retrieve accommodation results", error);
          throw new Error(
            "Failed to retrieve accommodation results. Please try again.",
          );
        }
      }

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
