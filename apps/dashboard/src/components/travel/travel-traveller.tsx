"use client";

import { changeTravelTravellerAction } from "@/actions/travel/change-travel-traveller-action";
import { ItemCounter, ItemType } from "@/components/item-counter";
import { useI18n } from "@/locales/client";
import { Icons } from "@travelese/ui/icons";
import { useOptimisticAction } from "next-safe-action/hooks";

type Props = {
  value: Array<{ type: string }>;
  disabled?: boolean;
  onChange: (value: Array<{ type: string }>) => void;
};

export function TravelTraveller({ value, disabled, onChange }: Props) {
  const t = useI18n();

  const travellerTypes: ItemType[] = [
    {
      id: "adult",
      label: t("travel_passenger.adult"),
      subLabel: "12+",
      icon: <Icons.User className="h-4 w-4" />,
    },
    {
      id: "child",
      label: t("travel_passenger.child"),
      subLabel: "2-11",
      icon: <Icons.Child className="h-4 w-4" />,
    },
    {
      id: "infant_without_seat",
      label: t("travel_passenger.infant_without_seat"),
      subLabel: "Under 2",
      icon: <Icons.Infant className="h-4 w-4" />,
    },
  ];

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelTravellerAction,
    {
      currentState: value,
      updateFn: (_, newState) => newState,
    },
  );

  const currentPassengers = Array.isArray(optimisticState)
    ? optimisticState
    : value;

  const handleTravellerChange = (newCounts: Record<string, number>) => {
    const newPassengers = [];

    for (const type of travellerTypes) {
      const count = newCounts[type.id] || 0;
      for (let i = 0; i < count; i++) {
        newPassengers.push({ type: type.id });
      }
    }

    execute(newPassengers);
    onChange(newPassengers);
  };

  return (
    <ItemCounter
      items={travellerTypes}
      value={currentPassengers.reduce(
        (acc: Record<string, number>, passenger) => {
          acc[passenger.type] = (acc[passenger.type] || 0) + 1;
          return acc;
        },
        {},
      )}
      onChange={handleTravellerChange}
      disabled={disabled}
    />
  );
}
