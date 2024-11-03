import type { searchTravelSchema } from "@/actions/schema";
import { BotCard } from "@/components/chat/messages";
import { logger } from "@/utils/logger";
import type { Places } from "@duffel/api/Places/Suggestions/SuggestionsType";
import type { Offer } from "@duffel/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@travelese/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@travelese/ui/tooltip";
import type { z } from "zod";

interface Props {
  type: "flights" | "stays";
  travel: z.infer<typeof searchTravelSchema>;
  placeSuggestions: Array<Array<Places>>;
  searchResultsData: Record<string, string>;
}

const formatDuration = (duration: string) => {
  const match = duration.match(/PT(\d+)H(\d+)M/);
  if (match) {
    const [, hours, minutes] = match;
    return `${hours}h ${minutes}m`;
  }
  return duration;
};

export function TravelUI({ type, travel, searchResultsData }: Props) {
  // logger("searchResultsData", searchResultsData);

  const offers = (() => {
    try {
      // Add logging to debug the data structure
      logger("Raw searchResultsData", searchResultsData);
      const parsedData =
        typeof searchResultsData === "string"
          ? JSON.parse(searchResultsData)
          : searchResultsData;
      logger("Parsed searchResultsData", parsedData);

      // Access the offers property from the parsed data
      return Array.isArray(parsedData)
        ? parsedData
        : parsedData?.offers
          ? JSON.parse(parsedData.offers)
          : [];
    } catch (error) {
      logger("Error parsing offers", error);
      return [];
    }
  })();

  return (
    <BotCard className="font-sans space-y-4">
      <div className="flex flex-col gap-4">
        <div className="text-sm text-muted-foreground">
          Looking for {type} - {travel.search_type}
        </div>

        <div className="space-y-2">
          <div className="font-medium">Search Results:</div>
          {type === "flights" ? (
            <TooltipProvider>
              <div className="grid gap-4">
                {offers.map((offer: Offer) => (
                  <Card key={offer.id}>
                    <CardHeader>
                      <CardTitle className="text-sm flex justify-between items-center">
                        <span>
                          <Tooltip>
                            <TooltipTrigger>
                              {offer.slices[0]?.segments[0]?.origin.iata_code}
                            </TooltipTrigger>
                            <TooltipContent>
                              {offer.slices[0]?.segments[0]?.origin.city_name}
                            </TooltipContent>
                          </Tooltip>
                          {" → "}
                          <Tooltip>
                            <TooltipTrigger>
                              {
                                offer.slices[0]?.segments[0]?.destination
                                  .iata_code
                              }
                            </TooltipTrigger>
                            <TooltipContent>
                              {
                                offer.slices[0]?.segments[0]?.destination
                                  .city_name
                              }
                            </TooltipContent>
                          </Tooltip>
                        </span>
                        <span className="text-lg font-bold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: offer.total_currency,
                          }).format(Number(offer.total_amount))}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {offer.slices.map((slice: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <div>
                                <div className="font-medium">
                                  {slice.segments[0].origin.city_name}
                                </div>
                                <div className="text-muted-foreground">
                                  {new Date(
                                    slice.segments[0].departing_at,
                                  ).toLocaleString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {
                                    slice.segments[slice.segments.length - 1]
                                      .destination.city_name
                                  }
                                </div>
                                <div className="text-muted-foreground">
                                  {new Date(
                                    slice.segments[slice.segments.length - 1]
                                      .arriving_at,
                                  ).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{formatDuration(slice.duration)}</span>
                              <span>{slice.segments.length - 1} stops</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TooltipProvider>
          ) : (
            <div className="text-sm">
              Stay options found! {JSON.stringify(searchResultsData)}
            </div>
          )}
        </div>
      </div>
    </BotCard>
  );
}
