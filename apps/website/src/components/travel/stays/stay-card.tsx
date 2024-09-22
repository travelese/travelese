"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

import {
  StarIcon,
  WifiIcon,
  TvIcon,
  CoffeeIcon,
  UtensilsIcon,
  CarIcon,
  WavesIcon,
  DumbbellIcon,
  AirVentIcon,
  CalendarIcon,
  BriefcaseIcon,
  ConciergeBellIcon,
  UtensilsCrossedIcon,
  SofaIcon,
  UserIcon,
  WashingMachineIcon,
  BuildingIcon,
  BedDoubleIcon,
  MapPinIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { StaysSearchResult, StaysAccommodation } from "@duffel/api/types";

interface StayCardProps {
  stay: StaysSearchResult;
  onSelect: () => void;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });

const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const amenityIcons: Record<string, React.ElementType> = {
  business_centre: BriefcaseIcon,
  concierge: ConciergeBellIcon,
  room_service: UtensilsCrossedIcon,
  lounge: SofaIcon,
  "24_hour_front_desk": UserIcon,
  laundry: WashingMachineIcon,
  wifi: WifiIcon,
  tv: TvIcon,
  coffee: CoffeeIcon,
  restaurant: UtensilsIcon,
  parking: CarIcon,
  pool: WavesIcon,
  gym: DumbbellIcon,
  "air-conditioning": AirVentIcon,
};

const getAmenityIcon = (amenityType: string): React.ElementType => {
  return amenityIcons[amenityType.toLowerCase()] || StarIcon;
};

const StayCard: React.FC<StayCardProps> = ({ stay, onSelect }) => {
  const nights = calculateNights(stay.check_in_date, stay.check_out_date);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Card>
          <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between p-4 sm:p-6 rounded-lg cursor-pointer">
            <div className="w-full sm:w-2/3 space-y-4 sm:pr-5 sm:border-r sm:border-dashed">
              <StaySummary stay={stay} nights={nights} />
              <IncludedItems amenities={stay.accommodation.amenities} />
            </div>
            <div className="flex flex-col items-center justify-center w-full sm:w-1/3 mt-4 sm:mt-0 space-y-3">
              <Alert className="w-full sm:w-auto text-center">
                <div className="flex flex-col items-center">
                  <AlertTitle>
                    <div className="flex items-center mb-1">
                      {[...Array(stay.accommodation.rating)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className="h-4 w-4 text-muted-foreground"
                        />
                      ))}
                    </div>
                  </AlertTitle>
                  <AlertDescription>
                    {stay.accommodation.review_score?.toFixed(1) || "N/A"}/10
                  </AlertDescription>
                </div>
              </Alert>
              <div className="text-sm text-center" aria-live="polite">
                {stay.rooms} room(s) available
              </div>
              <div
                className="text-2xl font-bold text-center"
                aria-label={`Price: ${stay.accommodation.cheapest_rate_currency} ${stay.accommodation.cheapest_rate_total_amount}`}
              >
                {stay.accommodation.cheapest_rate_currency}{" "}
                {stay.accommodation.cheapest_rate_total_amount}
              </div>
              <Button className="w-full sm:w-auto" variant="outline">
                Lock price for {stay.accommodation.cheapest_rate_currency}{" "}
                {(
                  Number(stay.accommodation.cheapest_rate_total_amount) * 0.1
                ).toFixed(2)}
              </Button>
              <Button onClick={onSelect} className="w-full sm:w-auto">
                Select this stay
              </Button>
            </div>
          </div>
        </Card>
      </DrawerTrigger>{" "}
      <DrawerContent className="w-full max-w-full">
        <DrawerHeader>
          <DrawerTitle>Stay Details</DrawerTitle>
          <DrawerDescription>
            Detailed information about your selected stay
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col md:flex-row justify-center gap-4 p-4">
          <Card className="w-full md:w-[500px]">
            <ScrollArea className="h-[500px]">
              <CardHeader className="p-4 border-b">
                <CardTitle>{stay.accommodation.name}</CardTitle>
                <CardDescription>
                  {stay.accommodation.location.address.line_one},{" "}
                  {stay.accommodation.location.address.city_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <StayDetails stay={stay} nights={nights} />
              </CardContent>
            </ScrollArea>
          </Card>
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

const StaySummary: React.FC<{ stay: StaysSearchResult; nights: number }> =
  React.memo(({ stay, nights }) => {
    return (
      <div>
        <h3 className="text-sm font-medium mb-1">Stay Summary</h3>
        <div className="flex items-center justify-between">
          <div className="text-left pr-2">
            <div className="font-bold text-2xl">
              {formatDate(stay.check_in_date)}
            </div>
          </div>
          <Separator className="flex-1 sm:block" aria-hidden="true" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Avatar className="text-muted-foreground">
                    <AvatarImage
                      alt={`${stay.accommodation.name} Image`}
                      src={
                        stay.accommodation.photos?.[0]?.url ||
                        "/placeholder.svg"
                      }
                      className="filter grayscale hover:filter-none"
                    />
                    <AvatarFallback>
                      {stay.accommodation.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="grid grid-cols-2 gap-2">
                  {stay.accommodation.photos
                    ?.slice(0, 4)
                    .map((photo, index) => (
                      <img
                        key={index}
                        src={photo.url}
                        alt={`${stay.accommodation.name} photo ${index + 1}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                    ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Separator className="flex-1 sm:block" aria-hidden="true" />
          <div className="text-right pl-2">
            <div className="font-bold text-2xl">
              {formatDate(stay.check_out_date)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="text-xs">Check-in</div>
          </div>
          <div className="text-right">
            <div className="text-xs">Check-out</div>
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <time className="text-2xl font-bold">
            {stay.accommodation.check_in_information?.check_in_after_time ||
              "N/A"}
          </time>
          <span className="sr-only">Number of nights: </span>
          <Badge variant="outline">
            {nights} night{nights !== 1 ? "s" : ""}
          </Badge>
          <time className="text-2xl font-bold">
            {stay.accommodation.check_in_information?.check_out_before_time ||
              "N/A"}
          </time>
        </div>
      </div>
    );
  });

StaySummary.displayName = "StaySummary";

const IncludedItems: React.FC<{ amenities: StaysAccommodation["amenities"] }> =
  React.memo(({ amenities }) => (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <div className="text-sm font-medium">Included:</div>
      <TooltipProvider>
        {amenities?.slice(0, 5).map((amenity, index) => {
          const IconComponent = getAmenityIcon(amenity.type);
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 rounded-full p-1 cursor-help">
                  <IconComponent className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">{amenity.description}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{amenity.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  ));

IncludedItems.displayName = "IncludedItems";

const StayDetails: React.FC<{ stay: StaysSearchResult; nights: number }> = ({
  stay,
  nights,
}) => (
  <div className="segment m-2 space-y-4">
    <AccommodationHeader accommodation={stay.accommodation} />
    <StayDates stay={stay} nights={nights} />

    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center">
            <BuildingIcon className="w-5 h-5 mr-2" />
            <span>Accommodation Details</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <AccommodationDetails accommodation={stay.accommodation} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          <div className="flex items-center">
            <BedDoubleIcon className="w-5 h-5 mr-2" />
            <span>Room Details</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <RoomDetails rooms={stay.accommodation.rooms} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>
          <div className="flex items-center">
            <MapPinIcon className="w-5 h-5 mr-2" />
            <span>Location Information</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <LocationInformation location={stay.accommodation.location} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

const AccommodationHeader: React.FC<{
  accommodation: StaysAccommodation;
}> = ({ accommodation }) => (
  <div className="flex items-center justify-between w-full">
    <div className="flex flex-col">
      <h4 className="text-lg font-semibold">{accommodation.name}</h4>
      <div className="text-sm">
        {accommodation.location.address.line_one},{" "}
        {accommodation.location.address.city_name}
      </div>
      <div className="flex items-center mt-1">
        {[...Array(accommodation.rating)].map((_, i) => (
          <StarIcon key={i} className="h-4 w-4 text-muted-foreground" />
        ))}
      </div>
    </div>
    <Badge variant="secondary">
      {accommodation.review_score?.toFixed(1) || "N/A"}/10
    </Badge>
  </div>
);

const StayDates: React.FC<{ stay: StaysSearchResult; nights: number }> = ({
  stay,
  nights,
}) => (
  <div className="flex justify-between items-center">
    <time className="text-xl font-bold">{formatDate(stay.check_in_date)}</time>
    <div className="flex flex-col items-center">
      <Badge variant="secondary">{nights} nights</Badge>
      <div className="text-xs mt-1">
        {stay.accommodation.check_in_information?.check_in_after_time} -{" "}
        {stay.accommodation.check_in_information?.check_out_before_time}
      </div>
    </div>
    <time className="text-xl font-bold">{formatDate(stay.check_out_date)}</time>
  </div>
);

const AccommodationDetails: React.FC<{ accommodation: StaysAccommodation }> = ({
  accommodation,
}) => (
  <div className="space-y-2">
    <p className="text-sm">{accommodation.description}</p>
    {accommodation.key_collection && (
      <div className="text-sm">
        <h5 className="font-semibold">Key Collection</h5>
        <p>{accommodation.key_collection.instructions}</p>
      </div>
    )}
  </div>
);

const RoomDetails: React.FC<{ rooms: StaysAccommodation["rooms"] }> = ({
  rooms,
}) => (
  <div className="space-y-2">
    {rooms.map((room, index) => (
      <div key={index} className="border-t pt-2 first:border-t-0 first:pt-0">
        <h5 className="font-medium">{room.name}</h5>
        <div className="text-sm">
          {room.beds?.map((bed, bedIndex) => (
            <div key={bedIndex}>
              {bed.count} x {bed.type} bed
            </div>
          ))}
        </div>
        {room.rates[0] && (
          <div className="mt-1">
            <div className="font-bold">
              {room.rates[0].total_currency} {room.rates[0].total_amount}
            </div>
            <div className="text-sm">{room.rates[0].board_type}</div>
          </div>
        )}
      </div>
    ))}
  </div>
);

const LocationInformation: React.FC<{
  location: StaysAccommodation["location"];
}> = ({ location }) => (
  <div className="space-y-2">
    <div>
      <h5 className="font-semibold">Address</h5>
      <p className="text-sm">
        {location.address.line_one}, {location.address.city_name},{" "}
        {location.address.country_code}
      </p>
    </div>
  </div>
);

StayCard.displayName = "StayCard";

export default StayCard;
