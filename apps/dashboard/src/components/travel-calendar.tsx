"use client";

import { Button } from "@travelese/ui/button";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface CalendarProps {
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  selectedDate: Date | null;
  onAdjustDate: (days: number) => void;
  minDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({
  onSelectDate,
  onClose,
  selectedDate,
  onAdjustDate,
  minDate = startOfDay(new Date()),
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const startDay = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const isDateDisabled = (date: Date) => {
    return isBefore(date, minDate);
  };

  const renderCalendar = (monthOffset: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + monthOffset,
      1,
    );
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = daysInMonth(year, month);
    const startingDay = startDay(year, month);

    const calendarDays = [];
    for (let i = 0; i < startingDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    for (let i = 1; i <= days; i++) {
      const dayDate = new Date(year, month, i);
      const isSelected =
        selectedDate && dayDate.toDateString() === selectedDate.toDateString();
      const isToday = dayDate.toDateString() === new Date().toDateString();
      const isDisabled = isDateDisabled(dayDate);
      calendarDays.push(
        <motion.button
          key={`day-${i}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => !isDisabled && onSelectDate(dayDate)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm
            ${isSelected ? "bg-primary text-primary-foreground" : ""}
            ${isToday && !isSelected ? "border border-primary" : ""}
            ${!isSelected && !isToday && !isDisabled ? "hover:bg-accent" : ""}
            ${isDisabled ? "text-muted-foreground cursor-not-allowed" : ""}
          `}
          disabled={isDisabled}
        >
          {i}
        </motion.button>,
      );
    }

    return (
      <div className="w-full">
        <h3 className="mb-2 text-center font-semibold">
          {months[month]} {year}
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {calendarDays}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 rounded-lg shadow-lg w-[600px] bg-background">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Select date</h2>
        <div className="space-x-2">
          {[-5, -3, -1, 1, 3, 5].map((days) => (
            <Button
              key={days}
              variant="outline"
              size="sm"
              onClick={() => onAdjustDate(days)}
              className="text-xs"
            >
              {days > 0 ? "+" : ""}
              {days} day{Math.abs(days) !== 1 ? "s" : ""}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentDate(
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - 1,
                1,
              ),
            )
          }
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <div className="flex space-x-4">
          {renderCalendar(0)}
          {renderCalendar(1)}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentDate(
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                1,
              ),
            )
          }
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => selectedDate && onSelectDate(selectedDate)}>
          Set date
        </Button>
      </div>
    </div>
  );
};

export default Calendar;
