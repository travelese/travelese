"use client";

import { changeTravelBaggageAction } from "@/actions/travel/change-travel-baggage-action";
import { ItemCounter, ItemType } from "@/components/item-counter";
import { Icons } from "@travelese/ui/icons";
import { useOptimisticAction } from "next-safe-action/hooks";
import { parseAsJson, useQueryStates } from "nuqs";

const baggageTypes: ItemType[] = [
  {
    id: "carry_on",
    label: "Carry On",
    subLabel: "Baggage",
    icon: <Icons.CarryOn className="h-4 w-4" />,
  },
  {
    id: "cabin",
    label: "Cabin",
    subLabel: "Baggage",
    icon: <Icons.Cabin className="h-4 w-4" />,
  },
  {
    id: "checked",
    label: "Checked",
    subLabel: "Baggage",
    icon: <Icons.Checked className="h-4 w-4" />,
  },
];

type Props = {
  defaultValue: Record<string, number>;
  disabled?: boolean;
};

export function TravelBaggage({ defaultValue, disabled }: Props) {
  const [params, setParams] = useQueryStates(
    {
      travel_baggage:
        parseAsJson<Record<string, number>>().withDefault(defaultValue),
    },
    {
      shallow: false,
    },
  );

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelBaggageAction,
    {
      currentState: params.travel_baggage,
      updateFn: (_, newState) => newState,
    },
  );

  const handleBaggageChange = (newCounts: Record<string, number>) => {
    setParams({ travel_baggage: newCounts });
    execute(newCounts);
  };

  return (
    <ItemCounter
      items={baggageTypes}
      value={optimisticState || defaultValue}
      onChange={handleBaggageChange}
      disabled={disabled}
    />
  );
}
