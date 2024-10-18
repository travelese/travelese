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
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  formatISO,
  startOfDay,
} from "date-fns";
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

const today = startOfDay(new Date());

const periods = [
  {
    value: "-5d",
    label: "-5 days",
    range: {
      from: addDays(today, -5),
      to: today,
    },
  },
  {
    value: "-3d",
    label: "-3 days",
    range: {
      from: addDays(today, -3),
      to: today,
    },
  },
  {
    value: "-1d",
    label: "-1 day",
    range: {
      from: addDays(today, -1),
      to: today,
    },
  },
  {
    value: "+1d",
    label: "+1 day",
    range: {
      from: today,
      to: endOfDay(addDays(today, 1)),
    },
  },
  {
    value: "+3d",
    label: "+3 days",
    range: {
      from: today,
      to: endOfDay(addDays(today, 3)),
    },
  },
  {
    value: "+5d",
    label: "+5 days",
    range: {
      from: today,
      to: endOfDay(addDays(today, 5)),
    },
  },
  {
    value: "1w",
    label: "Next week",
    range: {
      from: today,
      to: endOfDay(addWeeks(today, 1)),
    },
  },
  {
    value: "1m",
    label: "Next month",
    range: {
      from: today,
      to: endOfDay(addMonths(today, 1)),
    },
  },
  {
    value: "3m",
    label: "Next 3 months",
    range: {
      from: today,
      to: endOfDay(addMonths(today, 3)),
    },
  },
];

export function TravelCalendar({ defaultValue, disabled }: Props) {
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
          <Button variant="outline" className="w-full justify-between">
            <Icons.Calendar className="w-4 h-4 mr-2" />
            <span className="flex-grow line-clamp-1 text-ellipsis text-left">
              {formatDateRange(new Date(params.from), new Date(params.to), {
                includeTime: false,
              })}
            </span>
            <Icons.ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-screen md:w-[550px] p-0 flex-col flex space-y-4"
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
            today={new Date()}
            selected={{
              from: params.from && new Date(params.from),
              to: params.to && new Date(params.to),
            }}
            defaultMonth={today}
            initialFocus
            fromDate={today}
            onSelect={handleChangePeriod}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
