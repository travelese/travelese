"use client";

import { changeTravelTravellerAction } from "@/actions/travel/change-travel-traveller-action";
import { ItemCounter, ItemType } from "@/components/item-counter";
import { Icons } from "@travelese/ui/icons";
import { useOptimisticAction } from "next-safe-action/hooks";
import { parseAsJson, useQueryStates } from "nuqs";

const travellerTypes: ItemType[] = [
  {
    id: "adult",
    label: "Adults",
    subLabel: "12+",
    icon: <Icons.User className="h-4 w-4" />,
  },
  {
    id: "child",
    label: "Children",
    subLabel: "2-11",
    icon: <Icons.Child className="h-4 w-4" />,
  },
  {
    id: "infant_without_seat",
    label: "Infants",
    subLabel: "Under 2",
    icon: <Icons.Infant className="h-4 w-4" />,
  },
];

type Props = {
  defaultValue: Array<{ type: string }>; // Expect an array of passenger objects
  disabled?: boolean;
};

export function TravelTraveller({ defaultValue, disabled }: Props) {
  // Initialize state with the default value
  const [params, setParams] = useQueryStates(
    {
      passengers:
        parseAsJson<Array<{ type: string }>>().withDefault(defaultValue),
    },
    {
      shallow: false,
    },
  );

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelTravellerAction,
    {
      currentState: params.passengers,
      updateFn: (_, newState) => newState,
    },
  );

  // Check if optimisticState is an array; if not, initialize it
  const currentPassengers = Array.isArray(optimisticState)
    ? optimisticState
    : [];

  const handleTravellerChange = (newCounts: Record<string, number>) => {
    const newPassengers = [];

    // Build the passenger array based on counts
    for (const type of travellerTypes) {
      const count = newCounts[type.id] || 0;
      for (let i = 0; i < count; i++) {
        newPassengers.push({ type: type.id });
      }
    }

    // Update the query state with the new passengers array
    setParams({ passengers: newPassengers });
    execute(newPassengers); // Execute the optimistic action with the new passengers
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
