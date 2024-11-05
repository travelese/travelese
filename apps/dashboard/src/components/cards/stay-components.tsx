import type { StaysAccommodation, StaysSearchResult } from "@duffel/api/types";
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
import { formatDate, formatTime } from "./travel-utils";

export function StaySummary({
  stay,
  label,
}: {
  stay: StaysSearchResult;
  label?: string;
}) {
  return (
    <div>
      {label && <h3 className="text-sm font-medium mb-1">{label}</h3>}
      <div className="flex items-center justify-between">
        <AccommodationHeader
          accommodation={stay.accommodation}
          checkIn={stay.check_in_date}
          checkOut={stay.check_out_date}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <time className="text-2xl font-bold">
          {formatTime(
            stay.accommodation.check_in_information?.check_in_after_time,
          )}
        </time>
        <div className="flex flex-col items-center">
          <Badge variant="outline">{stay.nights} nights</Badge>
          {stay.accommodation.distance_to_city_center && (
            <div className="text-xs mt-1">
              {stay.accommodation.distance_to_city_center.toLocaleString()} km
              to center
            </div>
          )}
        </div>
        <time className="text-2xl font-bold">
          {formatTime(
            stay.accommodation.check_in_information?.check_out_before_time,
          )}
        </time>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs">{formatDate(stay.check_in_date)}</div>
        <LocationInfo location={stay.accommodation.location} />
        <div className="text-xs">{formatDate(stay.check_out_date)}</div>
      </div>
    </div>
  );
}

function AccommodationHeader({
  accommodation,
  checkIn,
  checkOut,
}: {
  accommodation: StaysAccommodation;
  checkIn: string;
  checkOut: string;
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <AccommodationInfo
        name={accommodation.name}
        address={accommodation.location.address}
        rating={accommodation.rating}
      />
      <Separator className="flex-1 mx-4" />
      <AccommodationPhotos accommodation={accommodation} />
    </div>
  );
}

function AccommodationInfo({
  name,
  address,
  rating,
}: {
  name: string;
  address: StaysAccommodation["location"]["address"];
  rating: number;
}) {
  return (
    <div className="flex flex-col hover:text-primary transition-colors">
      <div className="flex items-center gap-2">
        <Icons.City className="w-5 h-5" />
        <div className="text-sm font-medium">{name}</div>
      </div>
      <div className="text-xs text-muted-foreground pt-1">
        {address.line_one}, {address.city_name}
      </div>
      {rating && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          {[...Array(rating)].map((_, i) => (
            <Icons.Star key={i} className="h-3 w-3" />
          ))}
        </div>
      )}
    </div>
  );
}

function LocationInfo({
  location,
}: { location: StaysAccommodation["location"] }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{location.address.city_name}</span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2 font-mono">
            <div className="text-sm">
              <Icons.MapPin className="h-4 w-4 inline-block mr-1" />
              {location.address.line_one}
            </div>
            <div className="text-xs text-muted-foreground">
              <Icons.City className="h-4 w-4 inline-block mr-1" />
              {location.address.city_name}, {location.address.country_code}
            </div>
            {location.coordinates && (
              <div className="text-xs text-muted-foreground">
                <Icons.Navigation className="h-4 w-4 inline-block mr-1" />
                {location.coordinates.latitude},{" "}
                {location.coordinates.longitude}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AccommodationPhotos({
  accommodation,
}: {
  accommodation: StaysAccommodation;
}) {
  if (!accommodation.photos?.length) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={accommodation.photos[0]?.url}
              alt={accommodation.name}
              className="filter grayscale hover:filter-none"
            />
            <AvatarFallback>{accommodation.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <div className="grid grid-cols-2 gap-2">
            {accommodation.photos.slice(0, 4).map((photo, index) => (
              <img
                key={index}
                src={photo.url}
                alt={`${accommodation.name} photo ${index + 1}`}
                className="w-24 h-24 object-cover rounded"
              />
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Amenities({
  amenities,
}: {
  amenities: StaysAccommodation["amenities"];
}) {
  if (!amenities?.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {amenities.map((amenity) => {
        const Icon = Icons[amenity.type.toLowerCase()] || Icons.Star;
        return (
          <TooltipProvider key={amenity.type}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Icon className="h-4 w-4" />
                  <span>{amenity.type}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-mono text-muted-foreground">
                {amenity.description}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
