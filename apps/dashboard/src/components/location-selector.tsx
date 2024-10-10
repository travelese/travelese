"use client";

import type { Places } from "@duffel/api/types";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Input } from "@travelese/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import * as React from "react";
import { listPlaceSuggestionsAction } from "../actions/travel/supporting-resources/list-place-suggestions-action";

interface LocationSelectorProps {
  placeholder: string;
  value: string;
  onChange: (value: string, iataCode: string) => void;
  type: "origin" | "destination" | "stays";
}

export default function LocationSelector({
  placeholder,
  value,
  onChange,
  type,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [places, setPlaces] = React.useState<Places[]>([]);

  const fetchPlaces = React.useCallback(async (query: string) => {
    if (query.length < 1) {
      setPlaces([]);
      return;
    }
    try {
      const result = await listPlaceSuggestionsAction({ query });
      setPlaces(result?.data || []);
    } catch (error) {
      console.error("Failed to fetch places:", error);
      setPlaces([]);
    }
  }, []);

  React.useEffect(() => {
    fetchPlaces(searchQuery);
  }, [searchQuery, fetchPlaces]);

  const cities = places.filter((place) => place.type === "city");
  const airports = places.filter((place) => place.type === "airport");

  const selectLocation = (place: Places) => {
    const selectedValue =
      place.type === "city"
        ? `${place.name} (${place.iata_code})`
        : `${place.city_name} (${place.iata_code})`;
    const iataCode =
      place.type === "city" ? place.iata_city_code : place.iata_code;
    onChange(selectedValue, iataCode);
    setIsOpen(false);
  };

  const updateSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    onChange(newQuery);
  };

  const clearSelection = () => {
    onChange("", "");
    setSearchQuery("");
  };

  const renderSelectedValue = () => {
    const selectedPlace = places.find((p) =>
      p.type === "city"
        ? `${p.name} (${p.iata_code})` === value
        : `${p.city_name} (${p.iata_code})` === value,
    );
    return selectedPlace
      ? selectedPlace.type === "city"
        ? `${selectedPlace.name} (${selectedPlace.iata_code})`
        : `${selectedPlace.city_name} (${selectedPlace.iata_code})`
      : value;
  };

  const renderPlaceList = (placeList: Places[], title: string) => (
    <div className="p-2">
      <h3 className="mb-2 px-2 text-sm font-semibold">{title}</h3>
      {placeList.map((place) => (
        <div
          key={place.id}
          className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer"
          onClick={() => selectLocation(place)}
          onKeyDown={(e) => e.key === "Enter" && selectLocation(place)}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center">
            {title === "Cities" ? (
              <Icons.City className="w-5 h-5 mr-3" />
            ) : (
              <Icons.Airport className="w-5 h-5 mr-3" />
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
            onClick={() => selectLocation(place)}
          >
            <Icons.Plus className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );

  const TypeIcon =
    type === "origin"
      ? Icons.FlightsDeparture
      : type === "destination"
        ? Icons.FlightsArrival
        : Icons.City;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          {value ? (
            <div className="flex items-center bg-background border border-input rounded-md px-3 py-2">
              <TypeIcon className="h-4 w-4 mr-2" />
              <span className="flex-grow">{renderSelectedValue()}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
              >
                <Icons.Clear className="h-4 w-4" />
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
            <TypeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-100 p-0" align="start">
        <div className="p-4 border-b">
          <div className="relative">
            <Input
              placeholder="Search places..."
              value={searchQuery}
              onChange={updateSearchQuery}
              className="pl-8"
            />
            <Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
          </div>
        </div>
        <div className="max-h-[300px] overflow-auto">
          {cities.length > 0 && renderPlaceList(cities, "Cities")}
          {airports.length > 0 && renderPlaceList(airports, "Airports")}
          {places.length === 0 && searchQuery.length > 0 && (
            <div className="p-4 text-center text-sm">No locations found</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
