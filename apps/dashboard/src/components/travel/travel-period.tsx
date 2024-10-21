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
  addMonths,
  addWeeks,
  endOfDay,
  formatISO,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";
import { formatDateRange } from "little-date";
import { useAction } from "next-safe-action/hooks";
import { parseAsString, useQueryStates } from "nuqs";

type Props = {
  defaultValue: {
    to?: string; // Optional for return trips
    from?: string; // Optional for all types
  };
  travelType: "one_way" | "multi_city" | "return"; // Added travelType prop
  disabled?: boolean;
};

const today = startOfDay(new Date());

const periods = [
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
];

export function TravelPeriod({ defaultValue, travelType, disabled }: Props) {
  const { execute } = useAction(changeTravelPeriodAction);

  const [params, setParams] = useQueryStates(
    {
      from: parseAsString.withDefault(defaultValue.from ?? ""),
      to: parseAsString.withDefault(defaultValue.to ?? ""),
    },
    {
      shallow: false,
    },
  );

  const handleRangePeriodChange = (
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

  const handleSingleDateChange = (date: Date | null) => {
    if (!date) return;

    const newRange = {
      from: formatISO(date, { representation: "date" }),
      // No 'to' field for single date selection
    };

    setParams(newRange);
    execute(newRange);
  };

  const fromDate = params.from ? parseISO(params.from) : null;
  const toDate = params.to ? parseISO(params.to) : null;

  const displayDateRange =
    isValid(fromDate) && isValid(toDate)
      ? formatDateRange(fromDate, toDate, { includeTime: false })
      : "Select dates";

  return (
    <div className="flex space-x-4">
      <Popover>
        <PopoverTrigger asChild disabled={Boolean(disabled)}>
          <Button variant="outline" className="w-full justify-between">
            <Icons.Calendar className="w-4 h-4 mr-2" />
            <span className="flex-grow line-clamp-1 text-ellipsis text-left">
              {displayDateRange}
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
                handleRangePeriodChange(
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

          {/* Render Calendar based on travelType */}
          {travelType === "return" ? (
            // Calendar for Return Trips (Range)
            <Calendar
              mode="range"
              numberOfMonths={2}
              today={new Date()}
              selected={{
                from: isValid(fromDate) ? fromDate : undefined,
                to: isValid(toDate) ? toDate : undefined,
              }}
              defaultMonth={today}
              initialFocus
              fromDate={today}
              onSelect={handleRangePeriodChange}
            />
          ) : (
            // Calendar for One-Way and Multi-City Trips (Single)
            <Calendar
              mode="single" // Single mode for one-way and multi-city
              numberOfMonths={2}
              today={new Date()}
              selected={{
                from: isValid(fromDate) ? fromDate : undefined,
              }}
              defaultMonth={today}
              initialFocus
              fromDate={today}
              onSelect={(date) => handleSingleDateChange(date)} // Only set from date
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
