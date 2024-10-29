"use client";

import { changeTravelBaggageAction } from "@/actions/change-travel-baggage-action";
import { ItemCounter, type ItemType } from "@/components/item-counter";
import { useI18n } from "@/locales/client";
import { Icons } from "@travelese/ui/icons";
import { useOptimisticAction } from "next-safe-action/hooks";

type Props = {
  value: Record<string, number>;
  disabled?: boolean;
  onChange: (value: Record<string, number>) => void;
};

export function TravelBaggage({ value, disabled, onChange }: Props) {
  const t = useI18n();

  const baggageTypes: ItemType[] = [
    {
      id: "carry_on",
      label: t("travel_baggage.carry_on"),
      subLabel: "Baggage",
      icon: <Icons.CarryOn className="h-4 w-4" />,
    },
    {
      id: "cabin",
      label: t("travel_baggage.cabin"),
      subLabel: "Baggage",
      icon: <Icons.Cabin className="h-4 w-4" />,
    },
    {
      id: "checked",
      label: t("travel_baggage.checked"),
      subLabel: "Baggage",
      icon: <Icons.Checked className="h-4 w-4" />,
    },
  ];

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelBaggageAction,
    {
      currentState: value,
      updateFn: (_, newState) => newState,
    },
  );

  const handleBaggageChange = (newCounts: Record<string, number>) => {
    execute(newCounts);
    onChange(newCounts);
  };

  return (
    <ItemCounter
      items={baggageTypes}
      value={optimisticState || value}
      onChange={handleBaggageChange}
      disabled={disabled}
    />
  );
}
