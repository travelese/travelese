"use client";

import { changeTravelTypeAction } from "@/actions/travel/change-travel-type-action";
import { changeTravelTypeSchema } from "@/actions/travel/schema";
import { useI18n } from "@/locales/client";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { useOptimisticAction } from "next-safe-action/hooks";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";

type Props = {
  disabled?: boolean;
};

export function TravelType({ disabled }: Props) {
  const t = useI18n();

  const [travelType, setTravelType] = useQueryState(
    "travel_type",
    parseAsString.withDefault("return"),
  );

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelTypeAction,
    {
      currentState: travelType,
      updateFn: (_, newState) => newState,
    },
  );

  useEffect(() => {
    if (!travelType) {
      setTravelType("return");
    }
  }, [travelType, setTravelType]);

  const handleTravelTypeChange = (newType: string) => {
    const result = changeTravelTypeSchema.safeParse(newType);
    if (result.success) {
      execute(newType);
      setTravelType(newType);
    }
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
          <Icons.ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[225px]" sideOffset={10}>
        {Object.values(changeTravelTypeSchema.enum).map((type) => (
          <Button
            key={type}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleTravelTypeChange(type)}
          >
            {t(`travel_type.${type}`)}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

