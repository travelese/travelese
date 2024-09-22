"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  PlaneTakeoffIcon,
  PlaneLandingIcon,
  HotelIcon,
  MapPinIcon,
} from "lucide-react";

import type { Places } from "@duffel/api/types";

interface PlacesSelectorProps {
  value: string;
  onSelect: (
    place:
      | string
      | {
          geographic_coordinates: {
            latitude: number | null;
            longitude: number | null;
          };
          radius: number;
          name: string;
        },
  ) => void;
  placeholder: string;
  type: "origin" | "destination" | "stay";
}

const PlacesSelector = React.forwardRef<HTMLButtonElement, PlacesSelectorProps>(
  ({ value, onSelect, placeholder, type }, ref) => {
    const [query, setQuery] = React.useState("");
    const [places, setPlaces] = React.useState<Places[]>([]);
    const [open, setOpen] = React.useState(false);

    const fetchPlaces = async (query: string) => {
      if (query.length < 1) {
        setPlaces([]);
        return;
      }
      try {
        const response = await fetch(
          `/api/travel/places?name=${encodeURIComponent(query)}`,
        );
        const result = await response.json();
        setPlaces(result.data || []);
      } catch (error) {
        setPlaces([]);
      }
    };

    React.useEffect(() => {
      fetchPlaces(query);
    }, [query]);

    const cities = places.filter((place) => place.type === "city");
    const airports = places.filter((place) => place.type === "airport");

    const IconComponent =
      type === "origin"
        ? PlaneTakeoffIcon
        : type === "destination"
          ? PlaneLandingIcon
          : MapPinIcon;

    const handleSelect = (place: Places) => {
      if (type === "stay") {
        onSelect({
          geographic_coordinates: {
            latitude: place.latitude,
            longitude: place.longitude,
          },
          radius: 5, // Default radius, can be made configurable
          name:
            place.type === "city"
              ? `${place.name} (${place.iata_code})`
              : `${place.city_name} (${place.iata_code})`,
        });
      } else {
        onSelect(place.iata_code);
      }
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="w-full justify-start text-left font-normal"
          >
            <IconComponent className="mr-2 h-4 w-4 shrink-0" />
            <span className="text-sm">
              {value
                ? places.find((p) => p.iata_code === value)
                  ? (() => {
                      const place = places.find((p) => p.iata_code === value)!;
                      if (place.type === "city") {
                        return `${place.name} (${place.iata_code})`;
                      } else {
                        return `${place.city_name} (${place.iata_code})`;
                      }
                    })()
                  : value
                : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start" side="bottom">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search places..."
              onValueChange={setQuery}
              value={query}
              className="h-9"
            />
            <CommandList>
              {cities.length > 0 && (
                <CommandGroup heading="Cities" className="px-1 py-2">
                  {cities.map((city) => (
                    <CommandItem
                      key={city.id}
                      value={city.id}
                      onSelect={() => handleSelect(city)}
                      className="text-sm"
                    >
                      {type === "stay" ? (
                        <HotelIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      ) : (
                        <IconComponent className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      )}
                      <span>{city.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {city.iata_code}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {airports.length > 0 && (
                <CommandGroup heading="Airports" className="px-1 py-2">
                  {airports.map((airport) => (
                    <CommandItem
                      key={airport.id}
                      value={airport.id}
                      onSelect={() => handleSelect(airport)}
                      className="text-sm"
                    >
                      <IconComponent className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <span>{airport.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {airport.iata_code}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

PlacesSelector.displayName = "PlacesSelector";

export default PlacesSelector;
