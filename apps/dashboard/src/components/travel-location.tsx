"use client";

import { listPlaceSuggestionsAction } from "@/actions/list-place-suggestions-action";
import { useI18n } from "@/locales/client";
import type { Places } from "@duffel/api/Places/Suggestions/SuggestionsType";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";

interface LocationSelectorProps {
  placeholder: string;
  value: string;
  onChange: (value: string, place: Places) => void;
  type: "origin" | "destination";
}

export function TravelLocation({
  placeholder,
  value,
  onChange,
  type,
}: LocationSelectorProps) {
  const t = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { execute: fetchPlaces, result } = useAction(
    listPlaceSuggestionsAction,
  );

  const places = result?.data || [];
  const cities = places.filter((place) => place.type === "city");
  const airports = places.filter((place) => place.type === "airport");

  const selectLocation = (place: Places) => {
    const selectedValue =
      place.type === "city"
        ? `${place.name} (${place.iata_code})`
        : `${place.city_name} (${place.iata_code})`;

    onChange(selectedValue, place);
    setIsOpen(false);
  };

  const updateSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    if (newQuery.length >= 1) {
      fetchPlaces({ query: newQuery });
    }
    onChange(newQuery, "");
  };

  const clearSelection = () => {
    onChange("", "");
    setSearchQuery("");
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
            {title === t("Cities") ? (
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
            <Icons.Plus className="size-4" />
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

  const displayValue = useMemo(() => {
    const selectedPlace = places.find((p) => p.iata_code === value);
    if (selectedPlace) {
      return selectedPlace.type === "city"
        ? `${selectedPlace.name} (${selectedPlace.iata_code})`
        : `${selectedPlace.city_name} (${selectedPlace.iata_code})`;
    }
    return value || placeholder;
  }, [value, places, placeholder]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-start text-left font-normal"
          onClick={() => setIsOpen(!isOpen)}
        >
          <TypeIcon className="mr-2 size-4 shrink-0" />
          <span className="flex-grow truncate">{displayValue}</span>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="size-4 p-0 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
            >
              <Icons.Clear className="size-4" />
            </Button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" sideOffset={10}>
        <div className="p-2 border-border">
          <div className="relative">
            <input
              placeholder={t("Search places...")}
              value={searchQuery}
              onChange={updateSearchQuery}
              className="pl-8 border-border"
            />
            <Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4" />
          </div>
        </div>
        <div className="w-[350px] overflow-auto">
          {cities.length > 0 && renderPlaceList(cities, t("Cities"))}
          {airports.length > 0 && renderPlaceList(airports, t("Airports"))}
          {places.length === 0 && searchQuery.length > 0 && (
            <div className="p-4 text-center text-sm">
              {t("No locations found")}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
