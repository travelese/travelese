"use client";

import { listPlaceSuggestionsAction } from "@/actions/travel/list-place-suggestions-action";
import { changeTravelLocationAction } from "@/actions/travel/change-travel-location-action";
import { changeTravelLocationSchema } from "@/actions/travel/schema";
import { useI18n } from "@/locales/client";
import type { Places } from "@duffel/api/Places/Suggestions/SuggestionsType";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { useAction, useOptimisticAction } from "next-safe-action/hooks";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";

type Props = {
  placeholder: string;
  type: "origin" | "destination";
  index: number;
  disabled?: boolean;
};

export function TravelLocation({ placeholder, type, index, disabled }: Props) {
  const t = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [origin, setOrigin] = useQueryState(
    `slices.${index}.origin`,
    parseAsString.withDefault(""),
  );

  const [destination, setDestination] = useQueryState(
    `slices.${index}.destination`,
    parseAsString.withDefault(""),
  );

  const currentValue = type === "origin" ? origin : destination;
  const setValue = type === "origin" ? setOrigin : setDestination;

  const { execute: fetchPlaces, result } = useAction(
    listPlaceSuggestionsAction,
  );

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelLocationAction,
    {
      currentState: { type, value: currentValue },
      updateFn: (_, newState) => newState,
    },
  );

  const places = result?.data || [];
  const cities = places.filter((place) => place.type === "city");
  const airports = places.filter((place) => place.type === "airport");

  const selectLocation = (place: Places) => {
    const iataCode = place.type === "city"
      ? place.iata_city_code
      : place.iata_code;
    if (iataCode) {
      const result = changeTravelLocationSchema.safeParse({
        type,
        value: iataCode,
      });
      if (result.success) {
        execute({ type, value: iataCode });
        setValue(iataCode);
      }
    }
    setIsOpen(false);
  };

  const updateSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    if (newQuery.length >= 1) {
      fetchPlaces({ query: newQuery });
    }
    setValue("");
  };

  const clearSelection = () => {
    setValue("");
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
            {title === t("Cities")
              ? <Icons.City className="w-5 h-5 mr-3" />
              : <Icons.Airport className="w-5 h-5 mr-3" />}
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

  const TypeIcon = type === "origin"
    ? Icons.FlightsDeparture
    : type === "destination"
    ? Icons.FlightsArrival
    : Icons.City;

  const displayValue = useMemo(() => {
    const selectedPlace = places.find((p) => p.iata_code === currentValue);
    if (selectedPlace) {
      return selectedPlace.type === "city"
        ? `${selectedPlace.name} (${selectedPlace.iata_code})`
        : `${selectedPlace.city_name} (${selectedPlace.iata_code})`;
    }
    return currentValue || placeholder;
  }, [currentValue, places, placeholder]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-start text-left font-normal"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <TypeIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-grow truncate">{displayValue}</span>
          {currentValue && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
            >
              <Icons.Clear className="h-4 w-4" />
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
            <Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
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
