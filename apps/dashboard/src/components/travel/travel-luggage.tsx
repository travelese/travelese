"use client";

import { changeTravelLuggageAction } from "@/actions/travel/change-travel-luggage-action";
import { ItemCounter } from "@/components/item-counter";
import { Icons } from "@travelese/ui/icons";

const luggageTypes = [
  {
    id: "cabin",
    label: "Cabin",
    subLabel: "Baggage",
    icon: <Icons.Briefcase className="h-4 w-4" />,
  },
  {
    id: "checked",
    label: "Checked",
    subLabel: "Baggage",
    icon: <Icons.Luggage className="h-4 w-4" />,
  },
] as const;

type Props = {
  initialValue: Record<string, number>;
  disabled?: boolean;
};

export function TravelLuggage({ initialValue, disabled }: Props) {
  return (
    <ItemCounter
      items={luggageTypes}
      initialValue={initialValue}
      disabled={disabled}
      action={changeTravelLuggageAction}
      stateKey="luggage"
    />
  );
}
