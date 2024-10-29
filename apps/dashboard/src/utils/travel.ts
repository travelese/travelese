import {
  addMinutes,
  addSeconds,
  eachDayOfInterval,
  format,
  parseISO,
  setHours,
  setMinutes,
} from "date-fns";

export const NEW_EVENT_ID = "new-event";

export function sortDates(dates: string[]) {
  return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
}

export function getTravelDates(
  range: string[] | null,
  selectedDate: string | null,
): Date[] {
  if (range) {
    return sortDates(range).map((dateString) => new Date(dateString));
  }

  if (selectedDate) {
    return [new Date(selectedDate)];
  }

  return [new Date()];
}

export const formatHour = (hour: number, timeFormat: number) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return format(date, timeFormat === 12 ? "hh:mm a" : "HH:mm");
};

export const getTimeFromDate = (date: Date) => {
  return format(date, "HH:mm");
};

export const getSlotFromDate = (date: Date) => {
  return date.getHours() * 4 + Math.floor(date.getMinutes() / 15);
};

export const createNewEvent = (
  slot: number,
  selectedBookingId: string | null,
): TravelBooking => {
  const startDate = setMinutes(
    setHours(new Date(), Math.floor(slot / 4)),
    (slot % 4) * 15,
  );
  const endDate = addMinutes(startDate, 15);
  return {
    id: NEW_EVENT_ID,
    start: startDate,
    end: endDate,
    booking: { id: selectedBookingId ?? "", name: "" },
  };
};

export const updateEventTime = (
  event: TravelBooking,
  start: Date,
  end: Date,
): TravelBooking => {
  return { ...event, start, end };
};

export const getDates = (
  selectedDate: string | null,
  sortedRange: string[] | null,
): string[] => {
  if (selectedDate) return [selectedDate];
  if (sortedRange && sortedRange.length === 2) {
    const [start, end] = sortedRange;
    if (start && end) {
      return eachDayOfInterval({
        start: parseISO(start),
        end: parseISO(end),
      }).map((date) => format(date, "yyyy-MM-dd"));
    }
  }
  return [];
};

export const transformTravelData = (
  event: any,
  selectedDate: string | null,
): TravelBooking => {
  const start = event.start
    ? parseISO(event.start)
    : parseISO(`${event.date || selectedDate}T09:00:00`);
  const end = event.end
    ? parseISO(event.end)
    : addSeconds(start, event.duration || 0);

  return {
    ...event,
    id: event.id,
    start,
    end,
    booking: {
      id: event.booking_id,
      name: event.booking?.name || "",
    },
    description: event.description,
  };
};
