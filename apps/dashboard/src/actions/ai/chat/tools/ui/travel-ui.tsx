import type { searchTravelSchema } from "@/actions/schema";
import { FlightCard } from "@/components/cards/flight-card";
import { StayCard } from "@/components/cards/stay-card";
import { BotCard } from "@/components/chat/messages";
import { logger } from "@/utils/logger";
import type { Places } from "@duffel/api/Places/Suggestions/SuggestionsType";
import type { Offer, StaysSearchResult } from "@duffel/api/types";
import type { z } from "zod";

interface Props {
  type: "flights" | "stays";
  travel: z.infer<typeof searchTravelSchema>;
  placeSuggestions: Array<Array<Places>>;
  searchResultsData: Record<string, string>;
}

export function TravelUI({ type, travel, searchResultsData }: Props) {
  const results = (() => {
    try {
      const parsedData =
        typeof searchResultsData === "string"
          ? JSON.parse(searchResultsData)
          : searchResultsData;

      if (type === "flights") {
        return Array.isArray(parsedData)
          ? parsedData
          : parsedData?.offers
            ? JSON.parse(parsedData.offers)
            : [];
      }

      // For stays
      return Array.isArray(parsedData)
        ? parsedData
        : parsedData?.stays
          ? JSON.parse(parsedData.stays)
          : [];
    } catch (error) {
      logger("Error parsing results", error);
      return [];
    }
  })();

  return (
    <BotCard className="font-sans space-y-4">
      <div className="flex flex-col gap-4 font-mono">
        <div className="text-sm text-muted-foreground">
          Looking for {type} - {travel.search_type}
        </div>

        <div className="space-y-2 font-mono">
          <div className="font-medium">
            Found {results.length} {type}
          </div>
          <div className="grid gap-4">
            {type === "flights"
              ? results.map((offer: Offer) => (
                  <FlightCard key={offer.id} offer={offer} />
                ))
              : results.map((stay: StaysSearchResult) => (
                  <StayCard key={stay.id} stay={stay} />
                ))}
          </div>
        </div>
      </div>
    </BotCard>
  );
}
