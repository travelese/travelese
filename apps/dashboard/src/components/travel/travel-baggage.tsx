"use client";

import { changeTravelBaggageAction } from "@/actions/travel/change-travel-baggage-action";
import { changeTravelBaggageSchema } from "@/actions/travel/schema";
import { ItemCounter, ItemType } from "@/components/item-counter";
import { useI18n } from "@/locales/client";
import { Icons } from "@travelese/ui/icons";
import { useOptimisticAction } from "next-safe-action/hooks";
import { parseAsJson, useQueryState } from "nuqs";

type Props = {
  disabled?: boolean;
};

export function TravelBaggage({ disabled }: Props) {
  const t = useI18n();

  const [baggage, setBaggage] = useQueryState(
    "baggage",
    parseAsJson<{
      carry_on: number;
      cabin: number;
      checked: number;
    }>().withDefault({
      carry_on: 0,
      cabin: 0,
      checked: 0,
    }),
  );

  const baggageTypes: ItemType[] = [
    {
      id: "carry_on",
      label: t("travel_baggage.carry_on"),
      icon: <Icons.CarryOn className="h-4 w-4" />,
    },
    {
      id: "cabin",
      label: t("travel_baggage.cabin"),
      icon: <Icons.Cabin className="h-4 w-4" />,
    },
    {
      id: "checked",
      label: t("travel_baggage.checked"),
      icon: <Icons.Checked className="h-4 w-4" />,
    },
  ];

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelBaggageAction,
    {
      currentState: baggage,
      updateFn: (_, newState) => newState,
    },
  );

  const handleBaggageChange = (newCounts: Record<string, number>) => {
    const newBaggage = {
      carry_on: newCounts.carry_on || 0,
      cabin: newCounts.cabin || 0,
      checked: newCounts.checked || 0,
    };

    const result = changeTravelBaggageSchema.safeParse(newBaggage);
    if (result.success) {
      execute(newBaggage);
      setBaggage(newBaggage);
    }
  };

  return (
    <ItemCounter
      items={baggageTypes}
      value={optimisticState}
      onChange={handleBaggageChange}
      disabled={disabled}
    />
  );
}
