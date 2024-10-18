"use client";

import { changeTravelTypeAction } from "@/actions/travel/change-travel-type-action";
import { useI18n } from "@/locales/client";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { ChevronDown } from "lucide-react";
import { useOptimisticAction } from "next-safe-action/hooks";
import { parseAsString, useQueryState } from "nuqs";

const options = ["return", "one_way", "multi_city", "nomad"] as const;
type TravelType = (typeof options)[number];

type Props = {
  initialValue: TravelType;
  disabled?: boolean;
  onChange?: (value: TravelType) => void;
};

export function TravelType({ initialValue, disabled, onChange }: Props) {
  const t = useI18n();
  const [travelType, setTravelType] = useQueryState(
    "tripType",
    parseAsString.withDefault(initialValue),
  );

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelTypeAction,
    {
      currentState: travelType,
      updateFn: (_, newState) => newState,
    },
  );

  const handleTravelTypeChange = (newTravelType: TravelType) => {
    setTravelType(newTravelType);
    execute(newTravelType);
    onChange?.(newTravelType);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <Icons.Airports className="h-4 w-4 mr-2" />
          <span className="flex-grow line-clamp-1 text-ellipsis text-left">
            {t(`travel_type.${optimisticState}`)}
          </span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[225px]" sideOffset={10}>
        {options.map((option) => (
          <Button
            key={option}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleTravelTypeChange(option)}
          >
            {t(`travel_type.${option}`)}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
