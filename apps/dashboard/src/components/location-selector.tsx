"use client";

import type { Places } from "@duffel/api/types";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Input } from "@travelese/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import {
  BuildingIcon,
  MapIcon,
  PlaneLandingIcon,
  PlaneTakeoffIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";
import { listPlaceSuggestionsAction } from "../actions/travel/supporting-resources/list-place-suggestions-action";

interface LocationSelectorProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type: "origin" | "destination" | "stay";
}

export default function LocationSelector({
  label,
  placeholder,
  value,
  onChange,
  type,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [places, setPlaces] = React.useState<Places[]>([]);

  const fetchPlaces = async (query: string) => {
    if (query.length < 1) {
      setPlaces([]);
      return;
    }
    try {
      const result = await listPlaceSuggestionsAction({ query });
      setPlaces(result.data || []);
    } catch (error) {
      console.error("Failed to fetch places:", error);
      setPlaces([]);
    }
  };

  React.useEffect(() => {
    fetchPlaces(query);
  }, [query]);

  const IconComponent =
    type === "origin"
      ? Icons.FlightsDeparture
      : type === "destination"
        ? Icons.FlightsArrival
        : MapIcon;

  const handleSelect = (place: Places) => {
    const selectedValue =
      place.type === "city"
        ? `${place.name} (${place.iata_code})`
        : `${place.city_name} (${place.iata_code})`;
    onChange(selectedValue);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setQuery(newValue);
  };

  const handleRemove = () => {
    onChange("");
    setQuery("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          {value ? (
            <div className="flex items-center bg-background border border-input rounded-md px-3 py-2">
              <IconComponent className="h-4 w-4 mr-2" />
              <span className="flex-grow">{value}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Input
              placeholder={placeholder}
              className="pl-10 pr-4"
              onClick={() => setIsOpen(true)}
              readOnly
            />
          )}
          {!value && (
            <>
              <IconComponent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
              <span className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground">
                {label}
              </span>
            </>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <div className="relative">
            <Input
              placeholder="Search places..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
          </div>
        </div>
        <div className="max-h-[300px] overflow-auto">
          {places.map((place) => (
            <div
              key={place.id}
              className="flex items-center justify-between p-4 hover:bg-accent cursor-pointer"
            >
              <div className="flex items-center">
                {place.type === "city" ? (
                  <BuildingIcon className="w-5 h-5 mr-3" />
                ) : (
                  <IconComponent className="w-5 h-5 mr-3" />
                )}
                <div>
                  <div className="text-sm">{place.name}</div>
                  {place.type === "airport" && (
                    <div className="text-xs text-muted-foreground">
                      {place.city_name}
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => handleSelect(place)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {places.length === 0 && query.length > 0 && (
            <div className="p-4 text-center text-sm">No locations found</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
