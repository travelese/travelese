"use client";

import { format } from "date-fns";
import type * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@travelese/ui/button";
import { Calendar } from "@travelese/ui/calendar";
import { cn } from "@travelese/ui/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";

import { Calendar as CalendarIcon } from "lucide-react";

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  onDateChange: (newDate: DateRange | undefined) => void;
}

const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
  className,
  date,
  onDateChange,
}) => {
  const formatDate = (date: Date | undefined) => {
    return date ? format(date, "LLL dd, y") : "";
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {formatDate(date?.from)} - {formatDate(date?.to)}
                </>
              ) : (
                formatDate(date?.from)
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
export { DatePickerWithRange };
