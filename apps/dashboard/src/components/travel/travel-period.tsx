"use client";

import { changeTravelPeriodAction } from "@/actions/travel/change-travel-period-action";
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

type Props = {
  index?: number;
  value: {
    from: string;
    to?: string;
  };
  travelType: "one_way" | "multi_city" | "return";
  disabled?: boolean;
  onChange: (value: { from: string; to?: string }) => void;
};

const today = startOfDay(new Date());

export function TravelPeriod({
  index,
  value,
  travelType,
  disabled,
  onChange,
}: Props) {
  const t = useI18n();

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
      currentState: value,
      updateFn: (_, newState) => newState,
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
        : value.from,
      to: range.to ? formatISO(range.to, { representation: "date" }) : value.to,
    };

    execute(newRange);
    onChange(newRange);
  };

  const handleSingleDateChange = (date: Date | null) => {
    if (!date) return;

    const newRange = {
      from: formatISO(date, { representation: "date" }),
    };

    execute(newRange);
    onChange(newRange);
  };

  const fromDate = optimisticState.from ? parseISO(optimisticState.from) : null;
  const toDate = optimisticState.to ? parseISO(optimisticState.to) : null;

  const displayDateRange = isValid(fromDate)
    ? isValid(toDate)
      ? formatDateRange(fromDate, toDate, { includeTime: false })
      : formatDateRange(fromDate, fromDate, { includeTime: false })
    : t("Select dates");

  return (
    <div className="flex space-x-4">
      <Popover>
        <PopoverTrigger asChild disabled={Boolean(disabled)}>
          <Button variant="ghost" className="w-full justify-between">
            <Icons.Calendar className="size-3 mr-1" />
            <span className="flex-grow line-clamp-1 text-ellipsis text-left">
              {displayDateRange}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-screen md:w-[550px] p-0 flex-col flex space-y-4"
          sideOffset={10}
          side="bottom"
        >
          {/*
          <div className="p-4 pb-0">
            <Select
              defaultValue={optimisticState.period ?? undefined}
              onValueChange={(value) =>
                handleRangePeriodChange(
                  periods.find((p) => p.value === value)?.range,
                  value,
                )
              }
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
*/}

          {travelType === "return" ? (
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
            <Calendar
              mode="single"
              numberOfMonths={2}
              today={new Date()}
              selected={isValid(fromDate) ? fromDate : undefined}
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
