"use client";

import { Button } from "@travelese/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@travelese/ui/dropdown-menu";
import { Icons } from "@travelese/ui/icons";
import { Label } from "@travelese/ui/label";
import { Slider } from "@travelese/ui/slider";
import { parseAsString, useQueryStates } from "nuqs";

type Props = {
  currencies: {
    id: string;
    name: string;
  }[];
};

export function TravelFilters({ currencies }: Props) {
  const [{ currency, maxPrice }, setFilters] = useQueryStates(
    {
      currency: parseAsString,
      maxPrice: parseAsString.withDefault("10000"),
    },
    {
      shallow: false,
    },
  );

  const allCurrencies = [
    {
      id: "base",
      name: "Base currency",
    },
    ...currencies,
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Icons.Filter size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end" className="w-[200px]">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Icons.Currency className="mr-2 h-4 w-4" />
            <span>Currency</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent sideOffset={14} alignOffset={-4}>
              <DropdownMenuRadioGroup
                value={currency ?? "base"}
                onValueChange={(value) =>
                  setFilters({ currency: value === "base" ? null : value })
                }
              >
                {allCurrencies.map((currency) => (
                  <DropdownMenuRadioItem key={currency.id} value={currency.id}>
                    {currency.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <div className="px-2 py-1.5">
          <Label htmlFor="max-price" className="text-sm font-medium">
            Max Price
          </Label>
          <Slider
            id="max-price"
            min={0}
            max={10000}
            step={100}
            value={[Number.parseInt(maxPrice)]}
            onValueChange={(value) =>
              setFilters({ maxPrice: value[0].toString() })
            }
            className="mt-2"
          />
          <div className="mt-1 text-right text-sm text-muted-foreground">
            ${maxPrice}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
