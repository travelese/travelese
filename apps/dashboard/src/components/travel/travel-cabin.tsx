"use client";

import { changeTravelCabinAction } from "@/actions/travel/change-travel-class-action";
import { useI18n } from "@/locales/client";
import { Button } from "@travelese/ui/button";
import { useOptimisticAction } from "next-safe-action/hooks";

const cabinClasses = [
  "economy",
  "premium_economy",
  "business",
  "first_class",
] as const;

type CabinClass = (typeof cabinClasses)[number];

type Props = {
  value: CabinClass;
  disabled?: boolean;
  onChange: (value: CabinClass) => void;
};

export function TravelCabin({ value, disabled, onChange }: Props) {
  const t = useI18n();

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelCabinAction,
    {
      currentState: value,
      updateFn: (_, newState) => newState,
    },
  );

  const handleCabinChange = (newCabinClass: CabinClass) => {
    execute(newCabinClass);
    onChange(newCabinClass);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {cabinClasses.map((cabinClass) => (
        <Button
          key={cabinClass}
          variant="outline"
          className={`w-full border-border ${
            optimisticState === cabinClass ? 'bg-white/10' : ''
          }`}
          onClick={() => handleCabinChange(cabinClass)}
          disabled={disabled}
        >
          <span>{t(`cabin_class.${cabinClass}`)}</span>
        </Button>
      ))}
    </div>
  );
}
