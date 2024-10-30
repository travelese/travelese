import { travelAgent } from "@/actions/ai/travel-agent";
import type { MutableAIState } from "@/actions/ai/types";
import { createPartialOfferRequestAction } from "@/actions/create-partial-offer-request-action";
import { listOffersAction } from "@/actions/list-offers-action";
import { listPlaceSuggestionsAction } from "@/actions/list-place-suggestions-action";
import { searchAccommodationAction } from "@/actions/search-accommodation-action";
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
      prompt: z.string().describe("Natural language travel search request"),
    }),
    generate: async (args) => {
      const { prompt } = args;
      const { object } = await travelAgent(prompt);
      const toolCallId = nanoid();

      const results = {
        type: object.type,
        data: null,
      };

      if (object.type === "flight" && object.flights) {
        const slicesWithIATA = await Promise.all(
          object.flights.slices.map(async (slice) => {
            const [originPlaces, destPlaces] = await Promise.all([
              listPlaceSuggestionsAction({ query: slice.origin }),
              listPlaceSuggestionsAction({ query: slice.destination }),
            ]);
            return {
              ...slice,
              origin: originPlaces[0]?.iata_code,
              destination: destPlaces[0]?.iata_code,
            };
          }),
        );

        const offerRequest = await createPartialOfferRequestAction({
          ...object.flights,
          slices: slicesWithIATA,
        });

        const { data } = await listOffersAction({
          offer_request_id: offerRequest.id,
        });

        results.data = data;
      }

      if (object.type === "stay" && object.stays) {
        const stayResults = await searchAccommodationAction(object.stays);
        results.data = stayResults;
      }

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
                toolName: "travelAgent",
                toolCallId,
                args,
              },
            ],
          },
          {
            id: nanoid(),
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolName: "travelAgent",
                toolCallId,
                result: results,
              },
            ],
          },
        ],
      });

      return <TravelUI {...results} />;
    },
  };
}
