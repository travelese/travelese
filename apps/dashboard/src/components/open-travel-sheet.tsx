"use client";

import { useTravelParams } from "@/hooks/use-travel-params";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@travelese/ui/tooltip";

export function OpenTravelSearchSheet() {
  const { setParams } = useTravelParams();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setParams({ search: true })}
          >
            <Icons.Search />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Search flights or stays</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function OpenTravelBookSheet() {
  const { setParams } = useTravelParams();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setParams({ book: true })}
          >
            <Icons.Ticket />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Book flight or stay</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function OpenTravelChangeSheet() {
  const { setParams } = useTravelParams();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setParams({ change: true })}
          >
            <Icons.Edit />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Change flight or cancel stay</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
