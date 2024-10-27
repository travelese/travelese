"use client";

import { deleteBookingAction } from "@/actions/booking/delete-booking-action";
import { updateBookingAction } from "@/actions/booking/update-booking-action";
import { updateBookingSchema } from "@/actions/schema";
import { TravelBookingForm } from "@/components/forms/travel-booking-form";
import { useTravelParams } from "@/hooks/use-travel-params";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@travelese/supabase/client";
import { getTravelBookingQuery } from "@travelese/supabase/queries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@travelese/ui/alert-dialog";
import { Drawer, DrawerContent, DrawerHeader } from "@travelese/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@travelese/ui/dropdown-menu";
import { useMediaQuery } from "@travelese/ui/hooks";
import { Icons } from "@travelese/ui/icons";
import { ScrollArea } from "@travelese/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader } from "@travelese/ui/sheet";
import { useToast } from "@travelese/ui/use-toast";
import { useAction } from "next-safe-action/hooks";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type Props = {
  userId: string;
  teamId: string;
};

export function TravelUpdateSheet({ teamId }: Props) {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { setParams, update, bookingId } = useTravelParams();
  const supabase = createClient();
  const id = bookingId ?? "";

  const isOpen = update !== null && Boolean(bookingId);

  const form = useForm<z.infer<typeof updateBookingSchema>>({
    resolver: zodResolver(updateBookingSchema),
    defaultValues: {
      id: undefined,
      name: undefined,
      description: undefined,
      rate: undefined,
      status: undefined,
      billable: undefined,
      estimate: 0,
      currency: undefined,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getTravelBookingQuery(supabase, {
        teamId,
        bookingId: id,
      });

      if (data) {
        form.reset({
          id: data.id,
          name: data.name,
          description: data.description ?? undefined,
          rate: data.rate ?? undefined,
          status: data.status ?? undefined,
          billable: data.billable ?? undefined,
          estimate: data.estimate ?? undefined,
          currency: data.currency ?? undefined,
        });
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const deleteAction = useAction(deleteBookingAction, {
    onSuccess: () => {
      setParams({ update: null, bookingId: null });
      form.reset();
    },
    onError: () => {
      toast({
        duration: 2500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
  });

  const updateAction = useAction(updateBookingAction, {
    onSuccess: () => {
      setParams({ update: null, bookingId: null });
      form.reset();
    },
    onError: () => {
      toast({
        duration: 3500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
  });

  if (isDesktop) {
    return (
      <AlertDialog>
        <Sheet
          open={isOpen}
          onOpenChange={() => setParams({ update: null, bookingId: null })}
        >
          <SheetContent>
            <SheetHeader className="mb-8 flex justify-between items-center flex-row">
              <h2 className="text-xl">Edit Booking</h2>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Icons.MoreVertical className="w-5 h-5" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-42"
                  sideOffset={10}
                  align="end"
                >
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
            </SheetHeader>

            <ScrollArea className="h-full p-0 pb-280" hideScrollbar>
              <TravelBookingForm
                form={form}
                isSaving={updateAction.status === "executing"}
                onSubmit={updateAction.execute}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteAction.execute({ id })}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setParams({ update: null, bookingId: null });
        }
      }}
    >
      <DrawerContent className="p-6">
        <DrawerHeader className="mb-8 flex justify-between items-center flex-row">
          <h2 className="text-xl">Edit Booking</h2>
        </DrawerHeader>

        <TravelBookingForm
          form={form}
          isSaving={updateAction.status === "executing"}
          onSubmit={updateAction.execute}
        />
      </DrawerContent>
    </Drawer>
  );
}
