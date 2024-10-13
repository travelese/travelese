"use client";

import { changeTravelCabinAction } from "@/actions/travel/change-travel-class-action";
import { useI18n } from "@/locales/client";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { useOptimisticAction } from "next-safe-action/hooks";

const options = [
  "economy",
  "premium_economy",
  "business",
  "first_class",
] as const;

type Props = {
  initialValue: (typeof options)[number];
  disabled?: boolean;
};

export function TravelCabin({ initialValue, disabled }: Props) {
  const t = useI18n();
  const { execute, optimisticState } = useOptimisticAction(
    changeTravelCabinAction,
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
          <Icons.Cabin className="h-4 w-4 mr-2" />
          <span>{t(`travel_cabin.${optimisticState}`)}</span>
          <Icons.ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[225px]">
        {options.map((option) => (
          <Button
            key={option}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => execute(option)}
          >
            {t(`travel_cabin.${option}`)}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
