import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerFooter,
  DrawerHeader,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  BackpackIcon,
  CloudFogIcon,
  BriefcaseIcon,
  PlaneIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PlaneLandingIcon,
  PlaneTakeoffIcon,
  LuggageIcon,
  BuildingIcon,
  WifiIcon,
  BatteryChargingIcon,
  ArrowUpDownIcon,
  ArmchairIcon,
  PersonStanding,
} from "lucide-react";
import type { Offer, OfferSlice } from "@duffel/api/types";
import type {
  OfferSliceSegment,
  OfferSliceSegmentStop,
  OfferSliceSegmentPassenger,
  BaggageType,
} from "@duffel/api/booking/Offers/OfferTypes";
import { Airport } from "@duffel/api/supportingResources/Airports/AirportsTypes";
import { segments } from "@/src/lib/db/schema";

interface FlyCardProps {
  offer: Offer;
  onSelect?: () => void;
}

const formatTime = (dateTime: string | undefined) =>
  dateTime
    ? new Date(dateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

const formatDate = (dateTime: string | undefined) =>
  dateTime
    ? new Date(dateTime).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })
    : "N/A";

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

interface FlightSummaryProps {
  slice: OfferSlice;
  label: string;
}

const FlightSummary: React.FC<FlightSummaryProps> = React.memo(
  ({ slice, label }) => {
    const dayDifference = calculateDayDifference(
      slice.segments[0]?.departing_at || "",
      slice.segments[slice.segments.length - 1]?.arriving_at || "",
    );

    const stopCount = slice.segments ? slice.segments.length - 1 : 0;

    const StopInfo: React.FC = () => {
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
              <div className="space-y-2">
                {slice.segments.slice(0, -1).map((segment, index) => (
                  <div key={index} className="text-sm">
                    <div>
                      {segment.destination.city?.name} (
                      {segment.destination.iata_code})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Duration: {formatDuration(segment.duration)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Arrival:{" "}
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }).format(new Date(segment.arriving_at))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Departure:{" "}
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }).format(new Date(segment.departing_at))}
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
      <div>
        <h3 className="text-sm font-medium mb-1">{label}</h3>
        <div className="flex items-center justify-between">
          <div className="text-left pr-2">
            <div className="font-bold text-2xl">{slice.origin.iata_code}</div>
          </div>
          <Separator className="flex-1 sm:block" aria-hidden="true" />
          <div className="items-center text-sm p-2">
            <span className="sr-only">Number of stops: </span>
            <StopInfo />
          </div>{" "}
          <Avatar className="text-muted-foreground">
            <AvatarImage
              alt={`${slice.segments[0]?.operating_carrier.name || ""} Logo`}
              src={
                slice.segments[0]?.operating_carrier.logo_symbol_url ||
                "/placeholder.svg"
              }
              className="filter grayscale hover:filter-none"
            />
            <AvatarFallback>
              {slice.segments[0]?.operating_carrier.iata_code}
            </AvatarFallback>
          </Avatar>
          <Separator className="flex-1 sm:block" aria-hidden="true" />
          <div className="text-right pl-2">
            <div className="font-bold text-2xl">
              {slice.destination.iata_code}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="text-xs">{slice.origin.name}</div>
          </div>
          <div className="text-right">
            <div className="text-xs">{slice.destination.name}</div>
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <time
            className="text-2xl font-bold"
            dateTime={slice.segments[0]?.departing_at}
          >
            {formatTime(slice.segments[0]?.departing_at)}
          </time>
          <Badge variant="outline">{formatDuration(slice.duration)}</Badge>
          <time
            className="relative text-2xl font-bold"
            dateTime={slice.segments[slice.segments.length - 1]?.arriving_at}
          >
            {formatTime(slice.segments[slice.segments.length - 1]?.arriving_at)}
            {dayDifference > 0 && (
              <sup
                aria-label={`Arrives ${dayDifference} day${
                  dayDifference > 1 ? "s" : ""
                } later`}
              >
                +{dayDifference}
              </sup>
            )}
          </time>
        </div>
      </div>
    );
  },
);

FlightSummary.displayName = "FlightSummary";

interface IncludedItemsProps {
  segments: OfferSliceSegment[];
}

const IncludedItems: React.FC<IncludedItemsProps> = React.memo(
  ({ segments }) => {
    const baggageIcons: Record<
      BaggageType,
      { icon: React.ElementType; label: string }
    > = {
      carry_on: { icon: BackpackIcon, label: "Carry-on Bag" },
      checked: { icon: BriefcaseIcon, label: "Checked Bag" },
    };

    const amenityIcons: Record<string, React.ElementType> = {
      seat_pitch: ArrowUpDownIcon,
      seat_type: ArmchairIcon,
      wifi: WifiIcon,
      power: BatteryChargingIcon,
    };

    const amenities = segments[0].passengers[0]?.cabin?.amenities;

    return (
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <div className="text-sm font-medium">Included:</div>
        <TooltipProvider>
          {/* Baggage Information */}
          {(
            Object.entries(baggageIcons) as [
              BaggageType,
              { icon: React.ElementType; label: string },
            ][]
          ).map(([type, { icon: Icon, label }]) => {
            const count = countBagType(type, segments);
            if (count > 0) {
              return (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 rounded-full p-1 cursor-help">
                      <span className="text-sm">{count}</span>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">{`${count} ${label}${
                        count > 1 ? "s" : ""
                      }`}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{`${count} ${label}${count > 1 ? "s" : ""}`}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }
            return null;
          })}

          {/* Amenities Information */}
          {amenities &&
            Object.entries(amenityIcons).map(([type, Icon]) => {
              const available =
                type === "wifi"
                  ? amenities.wifi?.available
                  : type === "power"
                    ? amenities.power?.available
                    : type === "seat_pitch"
                      ? !!amenities.seat?.pitch
                      : type === "seat_type"
                        ? !!amenities.seat?.type
                        : false;

              if (available) {
                return (
                  <Tooltip key={type}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 rounded-full p-1 cursor-help">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">{type}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{type.replace("_", " ")}</p>
                      {type === "wifi" && amenities.wifi?.cost && (
                        <p>Cost: {amenities.wifi.cost}</p>
                      )}
                      {type === "seat_pitch" && amenities.seat?.pitch && (
                        <p>Pitch: {amenities.seat.pitch}</p>
                      )}
                      {type === "seat_type" && amenities.seat?.type && (
                        <p>Type: {amenities.seat.type}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return null;
            })}
        </TooltipProvider>
      </div>
    );
  },
);

IncludedItems.displayName = "IncludedItems";

const FlyCard: React.FC<FlyCardProps> = ({ offer, onSelect }) => {
  if (!offer || !Array.isArray(offer.slices) || offer.slices.length === 0)
    return null;

  const [outbound, inbound] = offer.slices;
  const emission = offer.total_emissions_kg || "N/A";
  const price = offer.total_amount;
  const currency = offer.total_currency;
  const remainingSeats = offer?.available_services?.[0]?.total_amount || 0;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Card>
          <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between p-4 sm:p-6 rounded-lg cursor-pointer">
            <div className="w-full sm:w-2/3 space-y-4 sm:pr-5 sm:border-r sm:border-dashed">
              <FlightSummary slice={outbound} label="Outbound" />
              <IncludedItems segments={outbound.segments} />

              {inbound && (
                <>
                  <FlightSummary slice={inbound} label="Inbound" />
                  <IncludedItems segments={inbound.segments} />
                </>
              )}
            </div>
            <div className="flex flex-col items-center justify-center w-full sm:w-1/3 mt-4 sm:mt-0 space-y-3">
              <Alert className="w-full sm:w-auto text-center">
                <div className="flex flex-col items-center">
                  <CloudFogIcon className="h-4 w-4 mb-1" aria-hidden="true" />
                  <AlertTitle>Emission</AlertTitle>
                  <AlertDescription>
                    {emission} kg CO<sub>2</sub>
                  </AlertDescription>
                </div>
              </Alert>
              <div className="text-sm text-center" aria-live="polite">
                {remainingSeats} seat(s) left at this price
              </div>
              <div
                className="text-2xl font-bold text-center"
                aria-label={`Price: ${currency} ${price}`}
              >
                {currency} {price}
              </div>
              <Button className="w-full sm:w-auto" variant="outline">
                Lock price for {currency} {(Number(price) * 0.1).toFixed(2)}
              </Button>
              <Button onClick={onSelect} className="w-full sm:w-auto">
                Select this flight
              </Button>
            </div>
          </div>
        </Card>
      </DrawerTrigger>{" "}
      <DrawerContent className="w-full max-w-full">
        <DrawerHeader>
          <DrawerTitle>Flight Details</DrawerTitle>
          <DrawerDescription>
            Detailed information about your selected flight(s)
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col md:flex-row justify-center gap-4 p-4">
          <Card className="w-full md:w-[500px]">
            <ScrollArea className="h-[500px]">
              <CardHeader className="p-4 border-b">
                <CardTitle>To {outbound.destination.name}</CardTitle>
                <CardDescription>
                  Details of your outbound flight
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {outbound.segments.map((segment, index) => (
                  <FlySegment key={index} segment={segment} />
                ))}
              </CardContent>
            </ScrollArea>
          </Card>
          {inbound && (
            <Card className="w-full md:w-[500px] mt-4 md:mt-0">
              <ScrollArea className="h-[500px]">
                <CardHeader className="p-4 border-b">
                  <CardTitle>To {inbound.destination.name}</CardTitle>
                  <CardDescription>
                    Details of your inbound flight
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {inbound.segments.map((segment, index) => (
                    <FlySegment key={index} segment={segment} />
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose>
            <Button onClick={onSelect}>Confirm Selection</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const FlySegment: React.FC<{ segment: OfferSliceSegment }> = ({ segment }) => {
  const {
    aircraft,
    arriving_at,
    departing_at,
    destination,
    destination_terminal,
    distance,
    duration,
    id,
    marketing_carrier,
    marketing_carrier_flight_number,
    operating_carrier,
    operating_carrier_flight_number,
    origin,
    origin_terminal,
    passengers,
    stops,
  } = segment;

  const dayDifference = calculateDayDifference(departing_at, arriving_at);

  return (
    <div className="segment m-2 space-y-4">
      <FlightHeader
        origin={origin}
        destination={destination}
        originTerminal={origin_terminal}
        destinationTerminal={destination_terminal}
      />
      <FlightTimes
        departingAt={departing_at}
        arrivingAt={arriving_at}
        duration={duration}
        distance={distance}
        dayDifference={dayDifference}
      />

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex items-center">
              <PlaneIcon className="w-5 h-5 mr-2" />
              <span>Flight Details</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <FlightInformation
                marketingCarrier={marketing_carrier}
                marketingFlightNumber={marketing_carrier_flight_number}
                operatingCarrier={operating_carrier}
                operatingFlightNumber={operating_carrier_flight_number}
                aircraft={aircraft}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <div className="flex items-center">
              <PersonStanding className="w-5 h-5 mr-2" />
              <span>Passenger information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <PassengerInformation passengers={passengers} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            <div className="flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              <span>Stop Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <StopInformation stops={stops} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const FlightHeader: React.FC<{
  origin: OfferSliceSegment["origin"];
  destination: OfferSliceSegment["destination"];
  originTerminal: string | null;
  destinationTerminal: string | null;
}> = ({ origin, destination, originTerminal, destinationTerminal }) => (
  <div className="flex items-center justify-between w-full">
    <AirportInfo
      icon={PlaneTakeoffIcon}
      code={origin.iata_code ?? "UNKNOWN"}
      name={origin.name}
      terminal={originTerminal}
      align="left"
    />
    <AirportInfo
      icon={PlaneLandingIcon}
      code={destination.iata_code ?? "UNKNOWN"}
      name={destination.name}
      terminal={destinationTerminal}
      align="right"
    />
  </div>
);

const AirportInfo: React.FC<{
  icon: React.ElementType;
  code: string;
  name: string;
  terminal: string | null;
  align: "left" | "right";
}> = ({ icon: Icon, code, name, terminal, align }) => (
  <div
    className={`flex flex-col ${align === "left" ? "items-start" : "items-end"}`}
  >
    <div
      className={`flex items-center ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      <Icon className="w-5 h-5" />
      <div
        className={`text-sm font-medium ${align === "left" ? "ml-2" : "mr-2"}`}
      >
        {code}
      </div>
    </div>
    <div className="text-xs pt-1">{name}</div>
    {terminal && <div className="text-xs">Terminal: {terminal}</div>}
  </div>
);

const FlightTimes: React.FC<{
  departingAt: string;
  arrivingAt: string;
  duration: string | null;
  distance: string | null;
  dayDifference: number;
}> = ({ departingAt, arrivingAt, duration, distance, dayDifference }) => (
  <div className="flex justify-between items-center">
    <time className="text-xl font-bold">
      {new Date(departingAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </time>
    <div className="flex flex-col items-center">
      <Badge variant="secondary">{formatDuration(duration)}</Badge>
      {distance && (
        <div className="text-xs mt-1">
          {parseFloat(distance).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}{" "}
          km
        </div>
      )}
    </div>
    <time className="relative text-xl font-bold">
      {new Date(arrivingAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
      {dayDifference > 0 && <sup>+{dayDifference}</sup>}
    </time>
  </div>
);

const CarrierInfo: React.FC<{
  carrier: OfferSliceSegment["operating_carrier"];
}> = ({ carrier }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <MapPinIcon className="w-5 h-5" />
      <div className="ml-2 text-sm font-medium">{carrier.name}</div>
    </div>
    <Avatar className="ml-2">
      <AvatarImage
        alt={`${carrier.name} Logo`}
        src={carrier.logo_symbol_url || ""}
        style={{ filter: "grayscale(100%)" }}
      />
      <AvatarFallback>{carrier.iata_code}</AvatarFallback>
    </Avatar>
  </div>
);

const FlightInformation: React.FC<{
  marketingCarrier: OfferSliceSegment["marketing_carrier"];
  marketingFlightNumber: string;
  operatingCarrier: OfferSliceSegment["operating_carrier"];
  operatingFlightNumber: string;
  aircraft: OfferSliceSegment["aircraft"];
}> = ({
  marketingCarrier,
  marketingFlightNumber,
  operatingCarrier,
  operatingFlightNumber,
  aircraft,
}) => (
  <div>
    <h4 className="font-semibold">Flight Information</h4>
    <div className="grid grid-cols-2 gap-2 mt-2">
      <div>Marketing Carrier:</div>
      <div>{marketingCarrier.name}</div>
      <div>Marketing Flight Number:</div>
      <div>{marketingFlightNumber}</div>
      <div>Operating Carrier:</div>
      <div>{operatingCarrier.name}</div>
      <div>Operating Flight Number:</div>
      <div>{operatingFlightNumber}</div>
      <div>Aircraft:</div>
      <div>{aircraft?.name || "N/A"}</div>
    </div>
  </div>
);

const PassengerInformation: React.FC<{
  passengers: OfferSliceSegment["passengers"];
}> = ({ passengers }) => (
  <div>
    <h4 className="font-semibold">Passenger Information</h4>
    {passengers.map((passenger, index) => (
      <div key={passenger.passenger_id} className="mt-2">
        <h5 className="font-medium">Passenger {index + 1}</h5>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>Cabin Class:</div>
          <div>{passenger.cabin_class}</div>
          <div>Marketing Name:</div>
          <div>{passenger.cabin_class_marketing_name}</div>
          <div>Fare Basis Code:</div>
          <div>{passenger.fare_basis_code}</div>
        </div>
      </div>
    ))}
  </div>
);

const StopInformation: React.FC<{ stops: OfferSliceSegment["stops"] }> = ({
  stops,
}) =>
  stops &&
  stops.length > 0 && (
    <div>
      <h4 className="font-semibold">Stops</h4>
      {stops.map((stop, index) => (
        <div key={stop.id} className="mt-2">
          <h5 className="font-medium">
            Stop {index + 1}: {stop.airport.name}
          </h5>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>Arrival:</div>
            <div>{new Date(stop.arriving_at).toLocaleString()}</div>
            <div>Departure:</div>
            <div>{new Date(stop.departing_at).toLocaleString()}</div>
            <div>Duration:</div>
            <div>{formatDuration(stop.duration)}</div>
          </div>
        </div>
      ))}
    </div>
  );

FlyCard.displayName = "FlyCard";

export default FlyCard;
