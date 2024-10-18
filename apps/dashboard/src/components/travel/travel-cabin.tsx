"use client";

import { changeTravelCabinAction } from "@/actions/travel/change-travel-class-action";
import { useI18n } from "@/locales/client";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { useOptimisticAction } from "next-safe-action/hooks";
import { parseAsString, useQueryStates } from "nuqs";

const cabinClasses = [
  "economy",
  "premium_economy",
  "business",
  "first_class",
] as const;
type CabinClass = (typeof cabinClasses)[number];

type Props = {
  initialValue: CabinClass;
  disabled?: boolean;
};

export function TravelCabin({ initialValue, disabled }: Props) {
  const t = useI18n();
  const [{ cabinClass }, setQueryStates] = useQueryStates({
    cabinClass: parseAsString.withDefault(initialValue),
  });

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelCabinAction,
    {
      currentState: cabinClass,
      updateFn: (_, newState) => newState,
    },
  );

  const cabinChange = (cabinClass: CabinClass) => {
    setQueryStates({ cabinClass });
    execute(cabinClass);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <Icons.Cabin className="h-4 w-4 mr-2" />
          <span className="flex-grow line-clamp-1 text-ellipsis text-left">
            {t(`travel_cabin.${optimisticState}`)}
          </span>
          <Icons.ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[225px]">
        {cabinClasses.map((cabinClass) => (
          <Button
            key={cabinClass}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => cabinChange(cabinClass)}
          >
            {t(`travel_cabin.${cabinClass}`)}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
