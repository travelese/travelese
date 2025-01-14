"use client";

import { changeTravelTravellerAction } from "@/actions/travel/change-travel-traveller-action";
import { ItemCounter, type ItemType } from "@/components/item-counter";
import { useI18n } from "@/locales/client";
import { Icons } from "@travelese/ui/icons";
import { useOptimisticAction } from "next-safe-action/hooks";

type TravellerType = "adult" | "child" | "infant_without_seat";

type Props = {
  value: Array<{
    type: TravellerType;
    given_name?: string;
    family_name?: string;
    age?: number;
  }>;
  disabled?: boolean;
  onChange: (
    value: Array<{
      type: TravellerType;
      given_name?: string;
      family_name?: string;
      age?: number;
    }>,
  ) => void;
  searchType: "flights" | "stays";
};

export function TravelTraveller({
  value,
  disabled,
  onChange,
  searchType,
}: Props) {
  const t = useI18n();
  const isFlights = searchType === "flights";

  const travellerTypes: ItemType[] = isFlights
    ? [
        {
          id: "adult",
          label: t("travel_passenger.adult"),
          subLabel: "13 or above",
          icon: <Icons.User className="size-4" />,
        },
        {
          id: "child",
          label: t("travel_passenger.child"),
          subLabel: "2 - 12",
          icon: <Icons.Child className="size-4" />,
        },
        {
          id: "infant_without_seat",
          label: t("travel_passenger.infant_without_seat"),
          subLabel: "Under 2",
          icon: <Icons.Infant className="size-4" />,
        },
      ]
    : [
        {
          id: "adult",
          label: t("travel_guest.adult"),
          subLabel: "13 or above",
          icon: <Icons.User className="size-4" />,
        },
        {
          id: "child",
          label: t("travel_guest.child"),
          subLabel: "2 - 12",
          icon: <Icons.Child className="size-4" />,
        },
      ];

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelTravellerAction,
    {
      currentState: value,
      updateFn: (_, newState) => newState,
    },
  );

  const currentCounts = (
    Array.isArray(optimisticState)
      ? optimisticState
      : Array.isArray(value)
        ? value
        : []
  ).reduce((acc: Record<string, number>, traveller) => {
    acc[traveller.type] = (acc[traveller.type] || 0) + 1;
    return acc;
  }, {});

  const handleTravellerChange = (newCounts: Record<string, number>) => {
    const newTravellers = [];

    for (const type of travellerTypes) {
      const count = Math.max(
        type.id === "adult" ? 1 : 0,
        newCounts[type.id] || 0,
      );
      for (let i = 0; i < count; i++) {
        newTravellers.push({ type: type.id });
      }
    }

    execute(newTravellers);
    onChange(newTravellers);
  };

  return (
    <ItemCounter
      items={travellerTypes}
      value={currentCounts}
      onChange={handleTravellerChange}
      disabled={disabled}
    />
  );
}
