"use client";

import { changeTravelTypeAction } from "@/actions/travel/change-travel-type-action";
import { useI18n } from "@/locales/client";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { ChevronDown } from "lucide-react";
import { useOptimisticAction } from "next-safe-action/hooks";

const options = ["flights", "stays"] as const;

type Props = {
  initialValue: (typeof options)[number];
  disabled?: boolean;
};

export function TravelMode({ initialValue, disabled }: Props) {
  const t = useI18n();
  const { execute, optimisticState } = useOptimisticAction(
    changeTravelTypeAction,
    {
      currentState: initialValue,
      updateFn: (_, newState) => newState,
    },
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <Icons.ModeOfTravel className="size-4 mr-2" />
          <span className="flex-grow line-clamp-1 text-ellipsis text-left">
            {t(`travel_mode.${optimisticState}`)}
          </span>
          <ChevronDown className="ml-2 size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[225px]" sideOffset={10}>
        {options.map((option) => (
          <Button
            key={option}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => execute(option)}
          >
            {t(`travel_mode.${option}`)}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
