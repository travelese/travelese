import type { searchTravelSchema } from "@/actions/schema";
import { BotCard } from "@/components/chat/messages";
import { logger } from "@/utils/logger";
import type { Places } from "@duffel/api/Places/Suggestions/SuggestionsType";
import type {
  BaggageType,
  OfferSliceSegment,
} from "@duffel/api/booking/Offers/OfferTypes";
import type { Offer, OfferSlice } from "@duffel/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@travelese/ui/card";
import { Icons } from "@travelese/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@travelese/ui/tooltip";
import { format } from "date-fns";
import type { z } from "zod";

interface Props {
  type: "flights" | "stays";
  travel: z.infer<typeof searchTravelSchema>;
  placeSuggestions: Array<Array<Places>>;
  searchResultsData: Record<string, string>;
}

const formatTime = (dateTime: string | undefined) =>
  dateTime ? format(new Date(dateTime), "HH:mm") : "N/A";

const formatDate = (dateTime: string | undefined) =>
  dateTime ? format(new Date(dateTime), "dd MMM") : "N/A";

const formatDateTime = (dateTime: string | undefined) =>
  dateTime ? format(new Date(dateTime), "dd MMM, HH:mm") : "N/A";

const formatDuration = (isoDuration: string | null): string => {
  if (!isoDuration) return "N/A";
  const matches = isoDuration.match(
    /P(?:([0-9]+)Y)?(?:([0-9]+)M)?(?:([0-9]+)D)?T(?:([0-9]+)H)?(?:([0-9]+)M)?/,
  );
  if (!matches) return "N/A";
  const hours = matches[4] ? `${matches[4]}h` : "0h";
  const minutes = matches[5] ? `${matches[5]}m` : "0m";
  return `${hours} ${minutes}`;
};

const calculateDayDifference = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays - 1;
};

const calculateLayoverDuration = (
  currentSegment: OfferSliceSegment,
  nextSegment: OfferSliceSegment | undefined,
): string => {
  if (!nextSegment) return "";
  const layoverStart = new Date(currentSegment.arriving_at);
  const layoverEnd = new Date(nextSegment.departing_at);
  const durationMs = layoverEnd.getTime() - layoverStart.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `PT${hours}H${minutes}M`;
};

const countBagType = (
  type: BaggageType,
  segments: OfferSliceSegment[] | undefined,
): number => {
  return (
    segments?.reduce((acc, segment) => {
      return (
        acc +
        (segment.passengers?.reduce(
          (acc, passenger) =>
            acc +
            (passenger.baggages?.filter((bag) => bag.type === type).length ||
              0),
          0,
        ) || 0)
      );
    }, 0) || 0
  );
};

export function TravelUI({ type, travel, searchResultsData }: Props) {
  // logger("searchResultsData", searchResultsData);

  const offers = (() => {
    try {
      // logger("Raw searchResultsData", searchResultsData);
      const parsedData =
        typeof searchResultsData === "string"
          ? JSON.parse(searchResultsData)
          : searchResultsData;
      // logger("Parsed searchResultsData", parsedData);

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

  const dayDifference = calculateDayDifference(
    offers[0]?.slices[0]?.segments[0]?.departing_at || "",
    offers[0]?.slices[0]?.segments[offers[0]?.slices[0]?.segments.length - 1]
      ?.arriving_at || "",
  );

  const StopsInfo = ({ slice }: { slice: OfferSlice }) => {
    const stopCount = slice.segments ? slice.segments.length - 1 : 0;

    if (stopCount === 0) return <span>Direct</span>;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">
              {stopCount} stop{stopCount > 1 ? "s" : ""}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2 font-mono">
              {slice.segments.slice(0, -1).map((segment, index) => (
                <div key={segment.id} className="text-sm">
                  <div>
                    {segment.destination.city?.name} (
                    {segment.destination.iata_code})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Icons.Duration className="h-4 w-4" />{" "}
                    {formatDuration(segment.duration)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Icons.Landing className="h-4 w-4" />{" "}
                    {formatDateTime(segment.arriving_at)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Icons.Takeoff className="h-4 w-4" />{" "}
                    {formatDateTime(segment.departing_at)}
                  </div>
                  {index < stopCount - 1 && (
                    <div className="text-xs text-muted-foreground">
                      Layover:{" "}
                      {formatDuration(
                        calculateLayoverDuration(
                          segment,
                          slice.segments[index + 1],
                        ),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <BotCard className="font-sans space-y-4">
      <div className="flex flex-col gap-4 font-mono">
        <div className="text-sm text-muted-foreground">
          Looking for {type} - {travel.search_type}
        </div>

        <div className="space-y-2 font-mono">
          <div className="font-medium">
            Found {offers.length} {type}
          </div>
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
                              {
                                offer.slices[0]?.segments[0]?.marketing_carrier
                                  .name
                              }
                            </TooltipTrigger>
                            <TooltipContent className="font-mono text-muted-foreground">
                              {
                                offer.slices[0]?.segments[0]?.marketing_carrier
                                  .iata_code
                              }{" "}
                              {
                                offer.slices[0]?.segments[0]
                                  ?.marketing_carrier_flight_number
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
                      <div className="space-y-4 font-mono">
                        {offer.slices.map(
                          (slice: OfferSlice, sliceIndex: number) => (
                            <div key={slice.id} className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                {slice.segments.map((segment, segmentIndex) => (
                                  <div
                                    key={segment.id}
                                    className="flex items-center"
                                  >
                                    {segmentIndex === 0 && (
                                      <>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <div className="font-medium">
                                              {segment.origin.iata_code}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent className="font-mono text-muted-foreground">
                                            <Icons.City className="h-4 w-4" />{" "}
                                            {segment.origin.city_name}
                                            <br />
                                            <Icons.Airport className="h-4 w-4" />{" "}
                                            {segment.origin.name}
                                            <br />
                                            <Icons.Terminal className="h-4 w-4" />{" "}
                                            {segment.origin_terminal}
                                          </TooltipContent>
                                        </Tooltip>
                                        <div className="text-xs text-muted-foreground">
                                          {formatDateTime(segment.departing_at)}
                                        </div>
                                      </>
                                    )}
                                    <span className="mx-2">→</span>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <div className="font-medium">
                                          {segment.destination.iata_code}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="font-mono text-muted-foreground">
                                        <Icons.City className="h-4 w-4" />{" "}
                                        {segment.destination.city_name}
                                        <br />
                                        <Icons.Airport className="h-4 w-4" />{" "}
                                        {segment.destination.name}
                                        <br />
                                        <Icons.Terminal className="h-4 w-4" />{" "}
                                        {segment.destination_terminal}
                                      </TooltipContent>
                                    </Tooltip>
                                    <div className="text-xs text-muted-foreground">
                                      {formatDateTime(segment.arriving_at)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {formatDuration(slice.duration || "")}
                                  </span>
                                  <StopsInfo slice={slice} />
                                </div>
                                <div className="flex items-center gap-2">
                                  {countBagType("carry_on", slice.segments) >
                                    0 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1">
                                          <Icons.Backpack className="h-4 w-4" />
                                          <span>
                                            {countBagType(
                                              "carry_on",
                                              slice.segments,
                                            )}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="font-mono text-muted-foreground">
                                        {countBagType(
                                          "carry_on",
                                          slice.segments,
                                        )}{" "}
                                        Carry-on bag(s)
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {countBagType("checked", slice.segments) >
                                    0 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1">
                                          <Icons.Briefcase className="h-4 w-4" />
                                          <span>
                                            {countBagType(
                                              "checked",
                                              slice.segments,
                                            )}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="font-mono text-muted-foreground">
                                        {countBagType(
                                          "checked",
                                          slice.segments,
                                        )}{" "}
                                        Checked bag(s)
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1">
                                        <Icons.Cloud className="h-4 w-4" />
                                        <span>
                                          {Math.round(
                                            Number(offer.total_emissions_kg),
                                          )}
                                          kg
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="font-mono text-muted-foreground">
                                      CO₂ emissions:{" "}
                                      {Math.round(
                                        Number(offer.total_emissions_kg),
                                      )}
                                      kg
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
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
