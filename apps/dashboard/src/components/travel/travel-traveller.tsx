"use client";

import { changeTravelTravellerAction } from "@/actions/travel/change-travel-traveller-action";
import { ItemCounter } from "@/components/item-counter";
import { Icons } from "@travelese/ui/icons";

const travellerTypes = [
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
] as const;

type Props = {
  initialValue: Record<string, number>;
  disabled?: boolean;
};

export function TravelTraveller({ initialValue, disabled }: Props) {
  return (
    <ItemCounter
      items={travellerTypes}
      initialValue={initialValue}
      disabled={disabled}
      action={changeTravelTravellerAction}
      singularLabel="Traveller"
      pluralLabel="Travellers"
    />
  );
}
