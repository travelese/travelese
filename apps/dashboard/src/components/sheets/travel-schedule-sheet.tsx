"use client";

import { useTravelParams } from "@/hooks/use-travel-params";
import { Drawer, DrawerContent } from "@travelese/ui/drawer";
import { useMediaQuery } from "@travelese/ui/hooks";
import { Sheet, SheetContent } from "@travelese/ui/sheet";
import React from "react";
import { TravelSchedule } from "../travel-schedule";

type Props = {
  teamId: string;
  userId: string;
  timeFormat: number;
  lastBookingId?: string;
};

export function TravelScheduleSheet({
  teamId,
  userId,
  timeFormat,
  lastBookingId,
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { setParams, bookingId, range, selectedDate, update, create } =
    useTravelParams();

  const isOpen =
    !update &&
    !create &&
    (Boolean(bookingId) || range?.length === 2 || Boolean(selectedDate));

  if (isDesktop) {
    return (
      <Sheet
        open={isOpen}
        onOpenChange={() =>
          setParams({ bookingId: null, range: null, selectedDate: null })
        }
      >
        <SheetContent>
          <TravelSchedule
            teamId={teamId}
            userId={userId}
            timeFormat={timeFormat}
            bookingId={lastBookingId}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setParams({ bookingId: null, range: null, selectedDate: null });
        }
      }}
    >
      <DrawerContent>
        <TravelSchedule
          teamId={teamId}
          userId={userId}
          timeFormat={timeFormat}
          bookingId={lastBookingId}
        />
      </DrawerContent>
    </Drawer>
  );
}
