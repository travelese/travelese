import type { searchTravelSchema } from "@/actions/schema";
import { BotCard } from "@/components/chat/messages";
import { logger } from "@/utils/logger";
import type { Places } from "@duffel/api/Places/Suggestions/SuggestionsType";
import { Icons } from "@travelese/ui/icons";
import type { z } from "zod";

interface Props {
  type: "flights" | "stays";
  travel: z.infer<typeof searchTravelSchema>;
  placeSuggestions: Array<Array<Places>>;
  searchResults?:
    | {
        type: "flight";
        listOffersId: string;
      }
    | {
        type: "stays";
        accommodations: any;
      }
    | null;
}

export function TravelUI({
  type,
  travel,
  placeSuggestions,
  searchResults,
}: Props) {
  return (
    <BotCard className="font-sans space-y-4">
      <div className="flex flex-col gap-4">
        <div className="text-sm text-muted-foreground">
          Looking for {type} - {travel.search_type}
        </div>

        <div className="space-y-2">
          <div className="font-medium">Suggested locations:</div>
          {placeSuggestions?.map((suggestions, index) => (
            <div key={index} className="flex flex-wrap gap-2">
              {suggestions?.slice(0, 5).map((place) => (
                <div
                  key={place.id}
                  className="text-xs px-2 py-1 rounded-md bg-muted flex items-center gap-2"
                >
                  {place.type === "city" ? (
                    <>
                      {place.name} ({place.iata_code})
                      <Icons.City className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      {place.city_name} ({place.iata_code})
                      <Icons.Airport className="h-3 w-3" />
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {searchResults && (
          <div className="space-y-2">
            <div className="font-medium">Search Results:</div>
            {searchResults.type === "flight" ? (
              <div className="text-sm">
                Flight offers found! Offer ID: {searchResults.listOffersId}
              </div>
            ) : (
              <div className="text-sm">
                Stay options found!{" "}
                {JSON.stringify(searchResults.accommodations)}
              </div>
            )}
          </div>
        )}
      </div>
    </BotCard>
  );
}
