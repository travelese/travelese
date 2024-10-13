"use client";

import { changeTravelLuggageAction } from "@/actions/travel/change-travel-luggage-action";
import { useI18n } from "@/locales/client";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { useOptimisticAction } from "next-safe-action/hooks";
import { useState } from "react";

const luggageTypes = ["cabin", "checked"] as const;
type LuggageType = (typeof luggageTypes)[number];
type LuggageCounts = Record<LuggageType, number>;

type Props = {
  initialValue: LuggageCounts;
  disabled?: boolean;
};

export function TravelLuggage({ initialValue, disabled }: Props) {
  const t = useI18n();
  const [counts, setCounts] = useState<LuggageCounts>(initialValue);

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelLuggageAction,
    {
      currentState: counts,
      updateFn: (_, newState) => newState,
    },
  );

  const handleCountChange = (type: LuggageType, change: number) => {
    const newCounts = {
      ...counts,
      [type]: Math.max(0, (counts[type] || 0) + change),
    };
    setCounts(newCounts);
    execute(newCounts);
  };

  const totalLuggage = Object.values(optimisticState).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <Icons.Luggage className="h-4 w-4 mr-2" />
          <span>
            {totalLuggage > 0 ? `${totalLuggage} ` : ""}
            {totalLuggage === 1 ? "Bag" : "Bags"}
          </span>
          <Icons.ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[225px]">
        <div className="space-y-4 mx-2">
          {luggageTypes.map((type) => (
            <div
              key={type}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex flex-col">{t(`travel_luggage.${type}`)}</div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCountChange(type, -1)}
                  disabled={!optimisticState[type]}
                  aria-label={`Decrease ${type} count`}
                  className="h-8 w-8"
                >
                  <Icons.Minus className="h-4 w-4" />
                </Button>
                <div className="w-8 text-center">
                  {optimisticState[type] || 0}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCountChange(type, 1)}
                  aria-label={`Increase ${type} count`}
                  className="h-8 w-8"
                >
                  <Icons.Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
