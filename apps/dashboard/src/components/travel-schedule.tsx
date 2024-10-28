"use client";

import { createTravelEntriesAction } from "@/actions/create-travel-entries-action";
import { deleteTravelEntryAction } from "@/actions/delete-travel-entries";
import { useTravelParams } from "@/hooks/use-travel-params";
import { secondsToHoursAndMinutes } from "@/utils/format";
import {
  NEW_EVENT_ID,
  createNewEvent,
  formatHour,
  getDates,
  getSlotFromDate,
  getTimeFromDate,
  transformTravelData,
  updateEventTime,
} from "@/utils/travel";
import { createClient } from "@travelese/supabase/client";
import { getTravelRecordsByDateQuery } from "@travelese/supabase/queries";
import { cn } from "@travelese/ui/cn";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@travelese/ui/context-menu";
import { ScrollArea } from "@travelese/ui/scroll-area";
import {
  addMinutes,
  addSeconds,
  differenceInSeconds,
  endOfDay,
  format,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { useAction } from "next-safe-action/hooks";
import React, { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { TravelBookingForm } from "./forms/travel-booking-form";
import { TravelDaySelect } from "./travel-day-select";

interface TravelBooking {
  id: string;
  start: Date;
  end: Date;
  booking: {
    id: string;
    name: string;
  };
  description?: string;
}

const ROW_HEIGHT = 36;
const SLOT_HEIGHT = 9;

type Props = {
  teamId: string;
  userId: string;
  timeFormat: number;
  bookingId?: string;
};

export function TravelSchedule({
  teamId,
  userId,
  timeFormat,
  bookingId,
}: Props) {
  const supabase = createClient();

  const scrollRef = useRef<HTMLDivElement>(null);
  const { selectedDate, range } = useTravelParams();
  const [selectedEvent, setSelectedEvent] = useState<TravelBooking | null>(
    null,
  );
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [data, setData] = useState<TravelBooking[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartSlot, setDragStartSlot] = useState<number | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [resizingEvent, setResizingEvent] = useState<TravelBooking | null>(
    null,
  );
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeType, setResizeType] = useState<"top" | "bottom" | null>(null);
  const [movingEvent, setMovingEvent] = useState<TravelBooking | null>(null);
  const [moveStartY, setMoveStartY] = useState(0);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    bookingId ?? null,
  );

  const createTravelEntries = useAction(createTravelEntriesAction, {
    onSuccess: (result) => {
      if (!result.data) return;

      setData((prevData) => {
        const processedData = result?.data.map((event) =>
          transformTravelData(event, selectedDate),
        );
        return prevData
          .filter((event) => event.id !== NEW_EVENT_ID)
          .concat(processedData);
      });

      const newTotalDuration = result.data.reduce((total, event) => {
        const start = event.start
          ? new Date(event.start)
          : new Date(`${event.date || selectedDate}T09:00:00`);
        const end = event.end
          ? new Date(event.end)
          : addSeconds(start, event.duration || 0);
        return total + differenceInSeconds(end, start);
      }, 0);
      setTotalDuration(newTotalDuration);

      const lastEvent = result.data.at(-1);
      setSelectedEvent(
        lastEvent ? transformTravelData(lastEvent, selectedDate) : null,
      );
    },
  });

  const deleteTravelEntry = useAction(deleteTravelEntryAction);

  const sortedRange = range?.sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    const fetchData = async () => {
      const travelData = await getTravelRecordsByDateQuery(supabase, {
        teamId,
        userId,
        date: selectedDate,
      });

      if (travelData?.data) {
        const processedData = travelData.data.map((event: any) =>
          transformTravelData(event, selectedDate),
        );

        setData(processedData);
        setTotalDuration(travelData.meta?.totalDuration || 0);
      } else {
        setData([]);
        setTotalDuration(0);
      }
    };

    if (selectedDate) {
      fetchData();
    }
  }, [selectedDate, teamId]);

  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = new Date().getHours();
      if (currentHour >= 12) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
        });
      } else {
        scrollRef.current.scrollTo({
          top: ROW_HEIGHT * 6,
        });
      }
    }
  }, []);

  const handleDeleteEvent = (eventId: string) => {
    if (eventId !== NEW_EVENT_ID) {
      deleteTravelEntry.execute({ id: eventId });
      setData((prevData) => prevData.filter((event) => event.id !== eventId));
      setSelectedEvent(null);

      // Update total duration
      setTotalDuration((prevDuration) => {
        const deletedEventDuration = differenceInSeconds(
          new Date(data.find((event) => event.id === eventId)?.end || 0),
          new Date(data.find((event) => event.id === eventId)?.start || 0),
        );
        return Math.max(0, prevDuration - deletedEventDuration);
      });
    }
  };

  useHotkeys(
    "backspace",
    () => {
      if (selectedEvent && selectedEvent.id !== NEW_EVENT_ID) {
        handleDeleteEvent(selectedEvent.id);
      }
    },
    [selectedEvent],
  );

  const currentOrNewEvent =
    data.find((event) => event.id === NEW_EVENT_ID) || selectedEvent;

  const handleMouseDown = (slot: number) => {
    if (selectedEvent && selectedEvent.id === NEW_EVENT_ID) {
      setData((prevData) =>
        prevData.filter((event) => event.id !== selectedEvent.id),
      );
    }
    setSelectedEvent(null);
    setIsDragging(true);
    setDragStartSlot(slot);

    const newEvent = createNewEvent(slot, selectedBookingId);

    setData((prevData) => [...prevData, newEvent]);
    setSelectedEvent(newEvent);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStartSlot !== null && selectedEvent) {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const slot = Math.floor(y / SLOT_HEIGHT);
      const start = Math.min(dragStartSlot, slot);
      const end = Math.max(dragStartSlot, slot);
      const startDate = setMinutes(
        setHours(new Date(), Math.floor(start / 4)),
        (start % 4) * 15,
      );
      const endDate = addMinutes(startDate, (end - start + 1) * 15);
      setData((prevData) =>
        prevData.map((event) =>
          event.id === selectedEvent.id
            ? updateEventTime(event, startDate, endDate)
            : event,
        ),
      );
      setSelectedEvent((prev) =>
        prev && prev.id === selectedEvent.id
          ? updateEventTime(prev, startDate, endDate)
          : prev,
      );
    } else if (resizingEvent && resizingEvent.id !== NEW_EVENT_ID) {
      const deltaY = e.clientY - resizeStartY;
      const deltaSlots = Math.round(deltaY / SLOT_HEIGHT);
      if (resizeType === "bottom") {
        const newEnd = addMinutes(resizingEvent.end, deltaSlots * 15);
        setData((prevData) =>
          prevData.map((event) =>
            event.id === resizingEvent.id
              ? updateEventTime(event, event.start, newEnd)
              : event,
          ),
        );
        setSelectedEvent((prev) =>
          prev && prev.id === resizingEvent.id
            ? updateEventTime(prev, prev.start, newEnd)
            : prev,
        );
      } else if (resizeType === "top") {
        const newStart = addMinutes(resizingEvent.start, deltaSlots * 15);
        setData((prevData) =>
          prevData.map((event) =>
            event.id === resizingEvent.id
              ? updateEventTime(event, newStart, event.end)
              : event,
          ),
        );
        setSelectedEvent((prev) =>
          prev && prev.id === resizingEvent.id
            ? updateEventTime(prev, newStart, prev.end)
            : prev,
        );
      }
    } else if (movingEvent) {
      const deltaY = e.clientY - moveStartY;
      const deltaSlots = Math.round(deltaY / SLOT_HEIGHT);
      const newStart = addMinutes(movingEvent.start, deltaSlots * 15);
      const newEnd = addMinutes(movingEvent.end, deltaSlots * 15);

      // Ensure the event doesn't move before start of day or after end of day
      const dayStart = startOfDay(movingEvent.start);
      const dayEnd = endOfDay(movingEvent.start);

      if (newStart >= dayStart && newEnd <= dayEnd) {
        setData((prevData) =>
          prevData.map((event) =>
            event.id === movingEvent.id
              ? updateEventTime(event, newStart, newEnd)
              : event,
          ),
        );
        setSelectedEvent((prev) =>
          prev && prev.id === movingEvent.id
            ? updateEventTime(prev, newStart, newEnd)
            : prev,
        );
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartSlot(null);
    setResizingEvent(null);
    setResizeType(null);
    setMovingEvent(null);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleEventResizeStart = (
    e: React.MouseEvent,
    event: TravelBooking,
    type: "top" | "bottom",
  ) => {
    if (event.id !== NEW_EVENT_ID) {
      e.stopPropagation();
      setResizingEvent(event);
      setResizeStartY(e.clientY);
      setResizeType(type);
      setSelectedEvent(event);
    }
  };

  const handleEventMoveStart = (e: React.MouseEvent, event: TravelBooking) => {
    e.stopPropagation();
    // Delete unsaved event if it exists
    setData((prevData) => prevData.filter((e) => e.id !== NEW_EVENT_ID));
    setMovingEvent(event);
    setMoveStartY(e.clientY);
    setSelectedEvent(event);
  };

  const handleEventClick = (event: TravelBooking) => {
    if (selectedEvent && selectedEvent.id === NEW_EVENT_ID) {
      setData((prevData) => prevData.filter((e) => e.id !== selectedEvent.id));
    }
    setSelectedEvent(event);
  };

  const handleCreateEvent = (values: {
    id?: string;
    start: string;
    end: string;
    assigned_id: string;
    booking_id: string;
    description?: string;
  }) => {
    const dates = getDates(selectedDate, sortedRange);
    const baseDate =
      dates[0] || selectedDate || format(new Date(), "yyyy-MM-dd");

    const startDate = parseISO(`${baseDate}T${values.start}`);
    const endDate = parseISO(`${baseDate}T${values.end}`);

    const newEvent = {
      id: values.id,
      start: startDate.toISOString(),
      stop: endDate.toISOString(),
      dates,
      team_id: teamId,
      assigned_id: values.assigned_id,
      booking_id: values.booking_id,
      description: values.description || "",
      duration: Math.max(0, differenceInSeconds(endDate, startDate)),
    };

    createTravelEntries.execute(newEvent);
  };

  return (
    <div className="w-full">
      <div className="text-left mb-8">
        <h2 className="text-xl text-[#878787]">
          {secondsToHoursAndMinutes(totalDuration)}
        </h2>
      </div>

      <TravelDaySelect />

      <ScrollArea ref={scrollRef} className="h-[calc(100vh-470px)] mt-8">
        <div className="flex text-[#878787] text-xs">
          <div className="w-20 flex-shrink-0 select-none">
            {hours.map((hour) => (
              <div
                key={hour}
                className="pr-4 flex font-mono flex-col"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                {formatHour(hour, timeFormat)}
              </div>
            ))}
          </div>

          <div
            className="relative flex-grow border border-border border-t-0"
            onMouseMove={handleMouseMove}
            onMouseDown={(e) => {
              if (e.button === 0 && !isContextMenuOpen) {
                // Check if left mouse button is pressed
                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const slot = Math.floor(y / SLOT_HEIGHT);
                handleMouseDown(slot);
              }
            }}
          >
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                <div
                  className="absolute w-full border-t border-border user-select-none"
                  style={{ top: `${hour * ROW_HEIGHT}px` }}
                />
              </React.Fragment>
            ))}
            {data?.map((event) => {
              const startSlot = getSlotFromDate(event.start);
              const endSlot = getSlotFromDate(event.end);
              const height = (endSlot - startSlot) * SLOT_HEIGHT;

              return (
                <ContextMenu
                  key={event.id}
                  onOpenChange={(open) => {
                    if (!open) {
                      // Delay closing the context menu to prevent it creating a new event
                      setTimeout(() => setIsContextMenuOpen(false), 50);
                    } else {
                      setIsContextMenuOpen(true);
                    }
                  }}
                >
                  <ContextMenuTrigger>
                    <div
                      onClick={() => handleEventClick(event)}
                      className={cn(
                        "absolute w-full bg-[#F0F0F0]/[0.95] dark:bg-[#1D1D1D]/[0.95] text-[#606060] dark:text-[#878787] border-t border-border",
                        selectedEvent?.id === event.id && "!text-primary",
                        event.id !== NEW_EVENT_ID && "cursor-move",
                      )}
                      style={{
                        top: `${startSlot * SLOT_HEIGHT}px`,
                        height: `${height}px`,
                      }}
                      onMouseDown={(e) =>
                        event.id !== NEW_EVENT_ID &&
                        handleEventMoveStart(e, event)
                      }
                    >
                      <div className="text-xs p-4 flex justify-between flex-col select-none pointer-events-none">
                        <span>
                          {event.booking.name} (
                          {secondsToHoursAndMinutes(
                            differenceInSeconds(event.end, event.start),
                          )}
                          )
                        </span>
                        <span>{event.description}</span>
                      </div>
                      {event.id !== NEW_EVENT_ID && (
                        <>
                          <div
                            className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize"
                            onMouseDown={(e) =>
                              handleEventResizeStart(e, event, "top")
                            }
                          />
                          <div
                            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize"
                            onMouseDown={(e) =>
                              handleEventResizeStart(e, event, "bottom")
                            }
                          />
                        </>
                      )}
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                    >
                      Delete <ContextMenuShortcut>⌫</ContextMenuShortcut>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      <TravelBookingForm
        eventId={currentOrNewEvent?.id}
        onCreate={handleCreateEvent}
        isSaving={createTravelEntries.isExecuting}
        userId={userId}
        teamId={teamId}
        bookingId={selectedBookingId}
        description={currentOrNewEvent?.description}
        start={
          currentOrNewEvent
            ? getTimeFromDate(currentOrNewEvent.start)
            : undefined
        }
        end={
          currentOrNewEvent ? getTimeFromDate(currentOrNewEvent.end) : undefined
        }
        onSelectBooking={(booking) => {
          setSelectedBookingId(booking.id);

          if (selectedEvent) {
            setData((prevData) =>
              prevData.map((event) =>
                event.id === selectedEvent.id
                  ? {
                      ...event,
                      booking: { id: booking.id, name: booking.name },
                    }
                  : event,
              ),
            );
          }
        }}
      />
    </div>
  );
}
