"use client";

import type { Offer } from "@duffel/api/types";
import { Icons } from "@travelese/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@travelese/ui/tooltip";
import { Ancillaries, FlightSummary } from "./flight-components";
import { BaggageInfo, StopsInfo } from "./flight-components";
import { TravelCard } from "./travel-card";
import { formatDate, formatDuration, formatTime } from "./travel-utils";

export function FlightCard({ offer }: { offer: Offer }) {
  return (
    <TravelCard
      type="flight"
      price={offer.total_amount}
      currency={offer.total_currency}
      emission={offer.total_emissions_kg}
    >
      <TooltipProvider>
        <div className="w-full sm:w-2/3 space-y-4 sm:pr-5 sm:border-r sm:border-dashed">
          {offer.slices.map((slice, sliceIndex) => (
            <div key={slice.id} className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {slice.segments.map((segment, segmentIndex) => (
                  <div key={segment.id} className="flex items-center">
                    {segmentIndex === 0 && (
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="border p-2 w-24 text-center">
                            <div className="font-medium">
                              {segment.origin.iata_code}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(segment.departing_at)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(segment.departing_at)}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="font-mono text-muted-foreground">
                          <Icons.City className="size-4" />{" "}
                          {segment.origin.city_name}
                          <br />
                          <Icons.Airport className="size-4" />{" "}
                          {segment.origin.name}
                          <br />
                          <Icons.Terminal className="size-4" />{" "}
                          {segment.origin_terminal}
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <span className="mx-2">→</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="border p-2 w-24 text-center">
                          <div className="font-medium">
                            {segment.destination.iata_code}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(segment.arriving_at)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(segment.arriving_at)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="font-mono text-muted-foreground">
                        <Icons.City className="size-4" />{" "}
                        {segment.destination.city_name}
                        <br />
                        <Icons.Airport className="size-4" />{" "}
                        {segment.destination.name}
                        <br />
                        <Icons.Terminal className="size-4" />{" "}
                        {segment.destination_terminal}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{formatDuration(slice.duration || "")}</span>
                  <StopsInfo slice={slice} />
                </div>
                <div className="flex items-center gap-2">
                  <BaggageInfo segments={slice.segments} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </TravelCard>
  );
}
