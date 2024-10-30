import { travelAgent } from "@/actions/ai/travel-agent";
import type { MutableAIState } from "@/actions/ai/types";
import { createPartialOfferRequestAction } from "@/actions/create-partial-offer-request-action";
import { listOffersAction } from "@/actions/list-offers-action";
import { listPlaceSuggestionsAction } from "@/actions/list-place-suggestions-action";
import { searchAccommodationAction } from "@/actions/search-accommodation-action";
import { logger } from "@/utils/logger";
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
      prompt: z.string(),
    }),
    generate: async (args) => {
      const { prompt } = args;
      const { object } = await travelAgent(prompt);

      if (object.type === "flight" && object.flights) {
        const slicePromises = object.flights.slices.map(async (slice) => {
          const [origin, destination] = await Promise.all([
            listPlaceSuggestionsAction({ query: slice.origin }),
            listPlaceSuggestionsAction({ query: slice.destination }),
          ]);

          const origin_code =
            origin?.data?.find((p) => p.type === "airport")?.iata_code ||
            origin?.data?.find((p) => p.type === "city")?.iata_code;

          const destination_code =
            destination?.data?.find((p) => p.type === "airport")?.iata_code ||
            destination?.data?.find((p) => p.type === "city")?.iata_code;

          return {
            origin: origin_code,
            destination: destination_code,
          };
        });

        return <TravelUI type={object.type} data={data} />;
      }

      if (object.type === "stay" && object.stays) {
        const data = await searchAccommodationAction({
          ...object.stays,
        });

        return <TravelUI type={object.type} data={data} />;
      }
    },
  };
}
