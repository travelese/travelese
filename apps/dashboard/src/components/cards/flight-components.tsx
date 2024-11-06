import type { Offer, OfferSlice, OfferSliceSegment } from "@duffel/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@travelese/ui/avatar";
import { Badge } from "@travelese/ui/badge";
import { Icons } from "@travelese/ui/icons";
import { Separator } from "@travelese/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@travelese/ui/tooltip";
import { ArmchairIcon, PlaneLandingIcon, PlaneTakeoffIcon } from "lucide-react";
import {
  calculateDayDifference,
  calculateLayoverDuration,
  countBagType,
  formatDate,
  formatDateTime,
  formatDuration,
  formatTime,
} from "./travel-utils";

export function FlightSummary({
  slice,
  label,
}: { slice: OfferSlice; label: string }) {
  const dayDifference = calculateDayDifference(
    slice.segments[0]?.departing_at || "",
    slice.segments[slice.segments.length - 1]?.arriving_at || "",
  );

  return (
    <div>
      <h3 className="text-sm font-medium mb-1">{label}</h3>
      <div className="flex items-center justify-between">
        <FlightHeader
          origin={slice.segments[0]?.origin}
          destination={slice.segments[slice.segments.length - 1]?.destination}
          originTerminal={slice.segments[0]?.origin_terminal}
          destinationTerminal={
            slice.segments[slice.segments.length - 1]?.destination_terminal
          }
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <time className="text-2xl font-bold">
          {formatTime(slice.segments[0]?.departing_at)}
        </time>
        <div className="flex flex-col items-center">
          <Badge variant="outline">{formatDuration(slice.duration)}</Badge>
          {slice.segments[0]?.distance && (
            <div className="text-xs mt-1">
              {Number.parseFloat(slice.segments[0].distance).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                },
              )}{" "}
              km
            </div>
          )}
        </div>
        <time className="text-2xl font-bold relative">
          {formatTime(slice.segments[slice.segments.length - 1]?.arriving_at)}
          {dayDifference > 0 && (
            <sup className="text-sm text-muted-foreground">
              +{dayDifference}
            </sup>
          )}
        </time>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs">
          {formatDate(slice.segments[0]?.departing_at)}
        </div>
        <StopsInfo slice={slice} />
        <div className="text-xs">
          {formatDate(slice.segments[slice.segments.length - 1]?.arriving_at)}
        </div>
      </div>
    </div>
  );
}

function FlightHeader({
  origin,
  destination,
  originTerminal,
  destinationTerminal,
}: {
  origin: OfferSliceSegment["origin"];
  destination: OfferSliceSegment["destination"];
  originTerminal: string | null;
  destinationTerminal: string | null;
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <AirportInfo
        icon={PlaneTakeoffIcon}
        code={origin.iata_code ?? "UNKNOWN"}
        name={origin.name}
        terminal={originTerminal}
        align="left"
      />
      <Separator className="flex-1 mx-4" />
      <AirportInfo
        icon={PlaneLandingIcon}
        code={destination.iata_code ?? "UNKNOWN"}
        name={destination.name}
        terminal={destinationTerminal}
        align="right"
      />
    </div>
  );
}

function AirportInfo({
  icon: Icon,
  code,
  name,
  terminal,
  align,
}: {
  icon: React.ElementType;
  code: string;
  name: string;
  terminal: string | null;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-col ${
        align === "left" ? "items-start" : "items-end"
      } hover:text-primary transition-colors`}
    >
      <div
        className={`flex items-center ${
          align === "right" ? "flex-row-reverse" : ""
        }`}
      >
        <Icon className="w-5 h-5" />
        <div
          className={`text-sm font-medium ${
            align === "left" ? "ml-2" : "mr-2"
          }`}
        >
          {code}
        </div>
      </div>
      <div className="text-xs text-muted-foreground pt-1">{name}</div>
      {terminal && (
        <div className="text-xs text-muted-foreground">
          Terminal: {terminal}
        </div>
      )}
    </div>
  );
}

export const StopsInfo = ({ slice }: { slice: OfferSlice }) => {
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
                  <Icons.Duration className="size-4" />{" "}
                  {formatDuration(segment.duration)}
                </div>
                <div className="text-xs text-muted-foreground">
                  <Icons.Landing className="size-4" />{" "}
                  {formatDateTime(segment.arriving_at)}
                </div>
                <div className="text-xs text-muted-foreground">
                  <Icons.Takeoff className="size-4" />{" "}
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

export function Ancillaries({ segments }: { segments: OfferSliceSegment[] }) {
  const segment = segments[0];
  if (!segment) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <div className="text-sm font-medium">Included:</div>
      {segment.passengers.map((passenger) => (
        <TooltipProvider key={passenger.passenger_id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="flex items-center gap-1">
                <ArmchairIcon className="h-3 w-3" />
                {passenger.cabin_class_marketing_name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <div>Cabin: {passenger.cabin_class}</div>
                <div>Fare: {passenger.fare_basis_code}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      <CarrierInfo carrier={segment.marketing_carrier} />
    </div>
  );
}

function CarrierInfo({
  carrier,
}: { carrier: OfferSliceSegment["marketing_carrier"] }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={carrier.logo_symbol_url || undefined}
                alt={carrier.name}
                className="filter grayscale hover:filter-none"
              />
              <AvatarFallback>{carrier.iata_code}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{carrier.name}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div>Flight: {carrier.iata_code}</div>
            <div>Aircraft: {carrier.name}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function BaggageInfo({ segments }: { segments: OfferSliceSegment[] }) {
  return (
    <>
      {countBagType("carry_on", segments) > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <Icons.Backpack className="size-4" />
              <span>{countBagType("carry_on", segments)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="font-mono text-muted-foreground">
            {countBagType("carry_on", segments)} Carry-on bag(s)
          </TooltipContent>
        </Tooltip>
      )}
      {countBagType("checked", segments) > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <Icons.Briefcase className="size-4" />
              <span>{countBagType("checked", segments)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="font-mono text-muted-foreground">
            {countBagType("checked", segments)} Checked bag(s)
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
