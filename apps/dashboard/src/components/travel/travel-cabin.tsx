"use client";

import { changeTravelCabinAction } from "@/actions/travel/change-travel-class-action";
import { changeTravelCabinSchema } from "@/actions/travel/schema";
import { useI18n } from "@/locales/client";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { useOptimisticAction } from "next-safe-action/hooks";
import { parseAsString, useQueryState } from "nuqs";

type Props = {
  disabled?: boolean;
};

export function TravelCabin({ disabled }: Props) {
  const t = useI18n();

  const [cabinClass, setCabinClass] = useQueryState(
    "cabin_class",
    parseAsString.withDefault("economy"),
  );

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelCabinAction,
    {
      currentState: cabinClass,
      updateFn: (_, newState) => newState,
    },
  );

  const handleCabinChange = (newCabinClass: string) => {
    const result = changeTravelCabinSchema.safeParse(newCabinClass);
    if (result.success) {
      execute(newCabinClass);
      setCabinClass(newCabinClass);
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
          <Icons.CabinClass className="h-4 w-4 mr-2" />
          <span className="flex-grow line-clamp-1 text-ellipsis text-left">
            {t(`cabin_class.${optimisticState}`)}
          </span>
          <Icons.ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[225px]" sideOffset={10}>
        {Object.values(changeTravelCabinSchema.enum).map((cabinClass) => (
          <Button
            key={cabinClass}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleCabinChange(cabinClass)}
          >
            {t(`cabin_class.${cabinClass}`)}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
