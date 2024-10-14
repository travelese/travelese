"use client";

import { changeTravelPassengerAction } from "@/actions/travel/change-travel-passenger-action";
import { useI18n } from "@/locales/client";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { useOptimisticAction } from "next-safe-action/hooks";
import { useState } from "react";

const passengerTypes = ["adult", "child", "infant_without_seat"] as const;
type PassengerType = (typeof passengerTypes)[number];
type PassengerCounts = Record<PassengerType, number>;

type Props = {
  initialValue: PassengerCounts;
  disabled?: boolean;
};

export function TravelPassenger({ initialValue, disabled }: Props) {
  const t = useI18n();
  const [counts, setCounts] = useState<PassengerCounts>(initialValue);

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelPassengerAction,
    {
      currentState: counts,
      updateFn: (_, newState) => newState,
    },
  );

  const handleCountChange = (type: PassengerType, change: number) => {
    const newCounts = {
      ...counts,
      [type]: Math.max(0, (counts[type] || 0) + change),
    };
    setCounts(newCounts);
    execute(newCounts);
  };

  const totalPassengers = Object.values(optimisticState).reduce(
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
          <Icons.User className="h-4 w-4 mr-2" />
          <span>
            {totalPassengers > 0 ? `${totalPassengers} ` : ""}
            {totalPassengers === 1 ? "Passenger" : "Passengers"}
          </span>
          <Icons.ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[225px]">
        <div className="space-y-4 mx-2">
          {passengerTypes.map((type) => (
            <div
              key={type}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex flex-col text-sm">
                {t(`travel_passenger.${type}`)}
              </div>

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
