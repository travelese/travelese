"use client";

import { changeTravelPeriodAction } from "@/actions/travel/change-travel-period-action";
import { changeTravelPeriodSchema } from "@/actions/travel/schema";
import { useI18n } from "@/locales/client";
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
import { useOptimisticAction } from "next-safe-action/hooks";
import { parseAsString, useQueryState } from "nuqs";

type Props = {
  index: number;
  disabled?: boolean;
  travelType: string;
};

const today = startOfDay(new Date());

export function TravelPeriod({ index, disabled, travelType }: Props) {
  const t = useI18n();

  const [fromDate, setFromDate] = useQueryState(
    `slices.${index}.from_date`,
    parseAsString.withDefault(""),
  );

  const [toDate, setToDate] = useQueryState(
    `slices.${index + 1}.to_date`,
    parseAsString.withDefault(""),
  );

  const periods = [
    {
      value: "1w",
      label: t("Next week"),
      range: {
        from: today,
        to: endOfDay(addWeeks(today, 1)),
      },
    },
    {
      value: "1m",
      label: t("Next month"),
      range: {
        from: today,
        to: endOfDay(addMonths(today, 1)),
      },
    },
  ];

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelPeriodAction,
    {
      currentState: {
        from: fromDate,
        to: travelType === "return" ? toDate : undefined,
      },
      updateFn: (_, newState) => newState,
    },
  );

  const handleRangePeriodChange = (
    range: { from: Date | null; to: Date | null } | undefined,
    periodValue?: string,
  ) => {
    if (!range) return;

    const newRange = {
      from: range.from
        ? formatISO(range.from, { representation: "date" })
        : fromDate,
      to: range.to
        ? formatISO(range.to, { representation: "date" })
        : undefined,
    };

    const result = changeTravelPeriodSchema.safeParse(newRange);
    if (result.success) {
      execute(newRange);
      setFromDate(newRange.from);
      if (newRange.to && travelType === "return") {
        setToDate(newRange.to);
      }
    }
  };

  const handleSingleDateChange = (date: Date | null) => {
    if (!date) return;

    const newRange = {
      from: formatISO(date, { representation: "date" }),
    };

    const result = changeTravelPeriodSchema.safeParse(newRange);
    if (result.success) {
      execute(newRange);
      setFromDate(newRange.from);
    }
  };

  const parsedFromDate = optimisticState.from
    ? parseISO(optimisticState.from)
    : null;
  const parsedToDate = optimisticState.to ? parseISO(optimisticState.to) : null;

  const displayDateRange = isValid(parsedFromDate)
    ? isValid(parsedToDate)
      ? formatDateRange(parsedFromDate, parsedToDate, { includeTime: false })
      : formatDateRange(parsedFromDate, parsedFromDate, { includeTime: false })
    : t("Select dates");

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
              defaultValue={optimisticState.period ?? undefined}
              onValueChange={(value) =>
                handleRangePeriodChange(
                  periods.find((p) => p.value === value)?.range,
                  value,
                )}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("Select a period")} />
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

          {travelType === "return" && index === 0
            ? (
              <Calendar
                mode="range"
                numberOfMonths={2}
                today={new Date()}
                selected={{
                  from: isValid(parsedFromDate) ? parsedFromDate : undefined,
                  to: isValid(parsedToDate) ? parsedToDate : undefined,
                }}
                defaultMonth={today}
                initialFocus
                fromDate={today}
                onSelect={handleRangePeriodChange}
              />
            )
            : (
              <Calendar
                mode="single"
                numberOfMonths={2}
                today={new Date()}
                selected={isValid(parsedFromDate) ? parsedFromDate : undefined}
                defaultMonth={today}
                initialFocus
                fromDate={today}
                onSelect={(date) => handleSingleDateChange(date)}
              />
            )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
