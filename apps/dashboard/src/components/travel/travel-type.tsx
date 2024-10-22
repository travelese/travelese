"use client";

import { changeTravelTypeAction } from "@/actions/travel/change-travel-type-action";
import { useI18n } from "@/locales/client";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { useOptimisticAction } from "next-safe-action/hooks";
import { parseAsString, useQueryStates } from "nuqs";

const travelTypes = [
  "return",
  "one_way",
  "multi_city",
  "digital_nomad",
] as const;
type TravelType = (typeof travelTypes)[number];

type Props = {
  defaultValue: TravelType;
  disabled?: boolean;
  onChange?: (value: TravelType) => void;
};

export function TravelType({ defaultValue, disabled, onChange }: Props) {
  const t = useI18n();
  const [params, setParams] = useQueryStates(
    {
      travel_type: parseAsString.withDefault(defaultValue),
    },
    {
      shallow: false,
    },
  );

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelTypeAction,
    {
      currentState: params.travel_type as TravelType,
      updateFn: (_, newState) => newState,
    },
  );

  const handleTravelTypeChange = (newTravelType: TravelType) => {
    setParams({ travel_type: newTravelType });
    execute(newTravelType);
    onChange?.(newTravelType);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <Icons.Airports className="h-4 w-4 mr-2" />
          <span className="flex-grow line-clamp-1 text-ellipsis text-left">
            {t(`travel_type.${optimisticState}`)}
          </span>
          <Icons.ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[225px]" sideOffset={10}>
        {travelTypes.map((travelType) => (
          <Button
            key={travelType}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleTravelTypeChange(travelType)}
          >
            {t(`travel_type.${travelType}`)}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
