"use client";

import { changeTravelTypeAction } from "@/actions/travel/change-travel-type-action";
import { useI18n } from "@/locales/client";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { useOptimisticAction } from "next-safe-action/hooks";

const travelTypes = ["return", "one_way", "multi_city"] as const;
type TravelType = (typeof travelTypes)[number];

type Props = {
  value: TravelType;
  disabled?: boolean;
  onChange: (value: TravelType) => void;
};

export function TravelType({ value, disabled, onChange }: Props) {
  const t = useI18n();

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelTypeAction,
    {
      currentState: value,
      updateFn: (_, newState) => newState,
    },
  );

  const handleTravelTypeChange = (newTravelType: TravelType) => {
    execute(newTravelType);
    onChange(newTravelType);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <Icons.Airports className="size-4 mr-2" />
          <span className="flex-grow line-clamp-1 text-ellipsis text-left">
            {t(`travel_type.${optimisticState}`)}
          </span>
          <Icons.ChevronDown className="ml-2 size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[225px]" sideOffset={10}>
        {travelTypes.map((travelType) => (
          <Button
            key={travelType}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleTravelTypeChange(travelType)}
          >
            {t(`travel_type.${travelType}`)}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
