"use client";

import { changeTravelPeriodAction } from "@/actions/travel/change-travel-period-action";
import { Button } from "@travelese/ui/button";
import { Calendar } from "@travelese/ui/calendar";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@travelese/ui/select";
import { formatISO, subWeeks } from "date-fns";
import { formatDateRange } from "little-date";
import { useAction } from "next-safe-action/hooks";
import { parseAsString, useQueryStates } from "nuqs";

type Props = {
  defaultValue: {
    to: string;
    from: string;
  };
  disabled?: string;
};

const periods = [
  {
    value: "1w",
    label: "This week",
    range: {
      from: subWeeks(new Date(), 1),
      to: new Date(),
    },
  },
];

export function TravelPeriod({ defaultValue, disabled }: Props) {
  const { execute } = useAction(changeTravelPeriodAction);

  const [params, setParams] = useQueryStates(
    {
      from: parseAsString.withDefault(defaultValue.from),
      to: parseAsString.withDefault(defaultValue.to),
      period: parseAsString,
    },
    {
      shallow: false,
    },
  );

  const handleChangePeriod = (
    range: { from: Date | null; to: Date | null } | undefined,
    period?: string,
  ) => {
    if (!range) return;

    const newRange = {
      from: range.from
        ? formatISO(range.from, { representation: "date" })
        : params.from,
      to: range.to
        ? formatISO(range.to, { representation: "date" })
        : params.to,
      period,
    };

    setParams(newRange);
    execute(newRange);
  };

  return (
    <div className="flex space-x-4">
      <Popover>
        <PopoverTrigger asChild disabled={Boolean(disabled)}>
          <Button
            variant="outline"
            className="justify-start text-left font-medium space-x-2"
          >
            <span className="line-clamp-1 text-ellipsis">
              {formatDateRange(new Date(params.from), new Date(params.to), {
                includeTime: false,
              })}
            </span>
            <Icons.ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-screen md:w-[550px] p-0 flex-col flex space-y-4"
          align="end"
          sideOffset={10}
        >
          <div className="p-4 pb-0">
            <Select
              defaultValue={params.period ?? undefined}
              onValueChange={(value) =>
                handleChangePeriod(
                  periods.find((p) => p.value === value)?.range,
                  value,
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a period" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Calendar
            mode="range"
            numberOfMonths={2}
            today={params.from ? new Date(params.from) : new Date()}
            selected={{
              from: params.from && new Date(params.from),
              to: params.to && new Date(params.to),
            }}
            defaultMonth={
              new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
            initialFocus
            toDate={new Date()}
            onSelect={handleChangePeriod}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
