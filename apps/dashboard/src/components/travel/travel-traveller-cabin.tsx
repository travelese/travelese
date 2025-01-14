"use client";

import { useState } from "react";
import { Icons } from "@travelese/ui/icons";
import { Button } from "@travelese/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { Separator } from "@travelese/ui/separator";
import { TravelTraveller } from "./travel-traveller";
import { TravelCabin } from "./travel-cabin";
import { useI18n } from "@/locales/client";

type Props = {
  form: UseFormReturn<z.infer<typeof searchTravelSchema>>;
  searchType: "flights" | "stays";
  onQueryParamsChange: (
    updates: Partial<z.infer<typeof searchTravelSchema>>,
  ) => void;
  isSubmitting: boolean;
};

export function TravelTravellerCabin({
  form,
  searchType,
  onQueryParamsChange,
  isSubmitting,
}: Props) {
  const t = useI18n();

  // Get current passengers/guests from form
  const currentTravellers = form.watch(
    searchType === "flights" ? "passengers" : "guests"
  );

  // Calculate total travellers
  const totalTravellers = currentTravellers.reduce(
    (sum, traveller) => sum + 1,
    0
  );

  // Get current cabin class
  const currentCabinClass = form.watch("cabin_class");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start border-none"
          disabled={isSubmitting}
        >
          <Icons.User className="size-4 mr-2" />
          <span className="flex-grow line-clamp-1 text-ellipsis text-left">
            {totalTravellers} {totalTravellers === 1 ? 'Traveller' : 'Travellers'}, 
            {` ${t(`cabin_class.${currentCabinClass}`)}`}
          </span>
          <Icons.ChevronDown className="ml-2 size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px]" sideOffset={10}>
        <div className="p-4 space-y-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium mb-3">
              {t(searchType === "flights" ? "travel_passenger.title" : "travel_guest.title")}
            </h4>
            <TravelTraveller
              value={currentTravellers}
              onChange={(value) => {
                form.setValue(
                  searchType === "flights" ? "passengers" : "guests",
                  value
                );
                onQueryParamsChange({
                  [searchType === "flights" ? "passengers" : "guests"]: value,
                });
              }}
              searchType={searchType}
              disabled={isSubmitting}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Cabin Class</h4>
            <TravelCabin
              value={currentCabinClass}
              onChange={(value) => {
                form.setValue("cabin_class", value);
                onQueryParamsChange({ cabin_class: value });
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

