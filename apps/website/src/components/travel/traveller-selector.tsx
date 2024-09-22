import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MinusIcon, PlusIcon, UserIcon } from "lucide-react";
import { Child } from "@kiwicom/orbit-components/icons";
import { Infant } from "@kiwicom/orbit-components/icons";
import type { DuffelPassengerType, Guest } from "@duffel/api/types";

const pluralize = (
  type: DuffelPassengerType | Guest["type"],
  count: number,
): string => {
  switch (type) {
    case "child":
      return count === 1 ? "Child" : "Children";
    case "infant_without_seat":
      return count === 1 ? "Infant" : "Infants";
    default:
      return count === 1 ? "Adult" : "Adults";
  }
};

const getPassengerIcon = (type: DuffelPassengerType | Guest["type"]) => {
  switch (type) {
    case "child":
      return <Child className="h-4 w-4" />;
    case "infant_without_seat":
      return <Infant className="h-4 w-4" />;
    default:
      return <UserIcon className="h-4 w-4" />;
  }
};

type TravellerType = DuffelPassengerType | Guest["type"];

interface TravellerSelectorProps {
  value: TravellerType[];
  onChange: (travellers: TravellerType[]) => void;
}

export default function TravellerSelector({
  value = [],
  onChange,
}: TravellerSelectorProps): React.ReactElement {
  const handleTravellerChange = (type: TravellerType, change: number) => {
    const updatedTravellers = [...value];

    if (change > 0) {
      updatedTravellers.push(type);
    } else {
      const index = updatedTravellers.indexOf(type);
      if (index !== -1) {
        updatedTravellers.splice(index, 1);
      }
    }

    onChange(updatedTravellers);
  };

  const travellerCounts = value.reduce<Record<string, number>>((acc, p) => {
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  const travellerTypes: TravellerType[] = [
    "adult",
    "child",
    "infant_without_seat",
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          {travellerTypes.map((type) => (
            <span key={type} className="flex items-center space-x-2 mx-2">
              {getPassengerIcon(type)}
              <span className="text-sm">{travellerCounts[type] || 0}</span>
            </span>
          ))}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3 border font-normal rounded-lg shadow-sm"
        align="start"
        side="bottom"
      >
        <div className="space-y-4">
          {travellerTypes.map((type) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getPassengerIcon(type)}
                <span className="text-sm font-medium">
                  {pluralize(type, travellerCounts[type] || 0)}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  size="icon"
                  variant="outline"
                  disabled={(travellerCounts[type] || 0) === 0}
                  className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                  onClick={() => handleTravellerChange(type, -1)}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="text-sm w-4 text-center">
                  {travellerCounts[type] || 0}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                  onClick={() => handleTravellerChange(type, 1)}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
