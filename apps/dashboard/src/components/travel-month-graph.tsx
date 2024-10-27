"use client";

import { useTravelStore } from "@/store/travel";
import { cn } from "@travelese/ui/cn";
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  formatISO,
  isAfter,
  isBefore,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { TravelDayCard } from "./travel-day-card";

export function TravelMonthGraph({
  date,
  onSelect,
  data,
  showCurrentDate,
  bookingId,
  disableHover,
  hideDaysIndicators,
  weekStartsOn,
}) {
  const { isTraveling } = useTravelStore();
  const currentDate = new Date(date);

  const weeks = eachWeekOfInterval(
    {
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    },
    { weekStartsOn },
  );

  const days = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn }),
    end: endOfWeek(currentDate, { weekStartsOn }),
  });

  const firstDay = startOfMonth(new Date(date));
  const lastDay = endOfMonth(new Date(date));

  const handleOnSelect = (params) => {
    if (onSelect) {
      onSelect({
        bookingId: params.bookingId || bookingId || "new",
        day: formatISO(params.day, { representation: "date" }),
      });
    }
  };

  const rows = weeks.map((day) => {
    const daysInWeek = eachDayOfInterval({
      start: startOfWeek(day, { weekStartsOn }),
      end: endOfWeek(day, { weekStartsOn }),
    });

    return daysInWeek.map((dayInWeek) => {
      const isoDate = formatISO(dayInWeek, { representation: "date" });

      return (
        <TravelDayCard
          key={isoDate}
          date={dayInWeek}
          data={data && data[isoDate]}
          disableHover={disableHover}
          onSelect={handleOnSelect}
          isActive={
            showCurrentDate && isSameDay(new Date(dayInWeek), currentDate)
          }
          isTraveling={
            isTraveling && isSameDay(new Date(dayInWeek), new Date())
          }
          outOfRange={
            isBefore(dayInWeek, firstDay) || isAfter(dayInWeek, lastDay)
          }
        />
      );
    });
  });

  const daysRows = days.map((day) => {
    return <span key={day.toDateString()}>{format(day, "iii")}</span>;
  });

  return (
    <div>
      <div
        className={cn(
          "grid gap-9 grid-cols-7",
          hideDaysIndicators && "gap-7 2xl:gap-9",
        )}
      >
        {rows}
      </div>

      <div
        className={cn(
          "gap-9 grid-cols-7 text-[#878787] text-sm mt-8 text-center grid",
          hideDaysIndicators && "hidden 2xl:grid",
        )}
      >
        {daysRows}
      </div>
    </div>
  );
}
