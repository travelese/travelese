"use client";

import type { StaysSearchResult } from "@duffel/api/types";
import { Icons } from "@travelese/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@travelese/ui/tooltip";
import { Amenities, StaySummary } from "./stay-components";
import { TravelCard } from "./travel-card";
import { formatDate } from "./travel-utils";

export function StayCard({ stay }: { stay: StaysSearchResult }) {
  return (
    <TravelCard
      type="stay"
      price={stay.cheapest_rate_total_amount}
      currency={stay.cheapest_rate_currency}
      rating={stay.accommodation.rating || undefined}
      reviewScore={stay.accommodation.review_score || undefined}
    >
      <TooltipProvider>
        <div className="w-full sm:w-2/3 space-y-4 sm:pr-5 sm:border-r sm:border-dashed">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="border p-2 w-24 text-center">
                      <div className="font-medium">Check-in</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(stay.check_in_date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stay.accommodation.check_in_information
                          ?.check_in_after_time || "N/A"}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="font-mono text-muted-foreground">
                    <Icons.City className="h-4 w-4" /> {stay.accommodation.name}
                    <br />
                    <Icons.MapPin className="h-4 w-4" />{" "}
                    {stay.accommodation.location.address.line_one}
                    <br />
                    <Icons.City className="h-4 w-4" />{" "}
                    {stay.accommodation.location.address.city_name}
                  </TooltipContent>
                </Tooltip>
                <span className="mx-2">→</span>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="border p-2 w-24 text-center">
                      <div className="font-medium">Check-out</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(stay.check_out_date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stay.accommodation.check_in_information
                          ?.check_out_before_time || "N/A"}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="font-mono text-muted-foreground">
                    <Icons.Calendar className="h-4 w-4" /> {stay.nights} night
                    {stay.nights !== 1 ? "s" : ""}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <StaySummary stay={stay} nights={stay.nights} />
              </div>
              <div className="flex items-center gap-2">
                <Amenities amenities={stay.accommodation.amenities} />
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </TravelCard>
  );
}
