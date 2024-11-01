"use client";

import { bookTravelAction } from "@/actions/book-travel-action";
import { bookTravelSchema } from "@/actions/schema";
import { BookTravelForm } from "@/components/forms/travel-book-form";
import { useTravelParams } from "@/hooks/use-travel-params";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer, DrawerContent, DrawerHeader } from "@travelese/ui/drawer";
import { useMediaQuery } from "@travelese/ui/hooks";
import { ScrollArea } from "@travelese/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader } from "@travelese/ui/sheet";
import { useToast } from "@travelese/ui/use-toast";
import { useAction } from "next-safe-action/hooks";
import React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type Props = {
  userId: string;
  currency: string;
};

export function BookTravelSheet({ userId, currency }: Props) {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { book, setParams } = useTravelParams();

  const form = useForm<z.infer<typeof bookTravelSchema>>({
    resolver: zodResolver(bookTravelSchema),
    defaultValues: {
      user_id: userId,
      currency,
    },
  });

  const action = useAction(bookTravelAction, {
    onSuccess: (data) => {
      toast({
        title: `${data.data?.type === "flights" ? "Flights" : "Stays"} Booked`,
        description: "Your booking has been created.",
        variant: "success",
      });
      setParams({ book: false });
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
      <Sheet open={book} onOpenChange={(open) => setParams({ book: open })}>
        <SheetContent>
          <SheetHeader className="mb-8 flex justify-between items-center flex-row">
            <h2 className="text-xl">Create Booking</h2>
          </SheetHeader>

          <ScrollArea className="h-full p-0 pb-28" hideScrollbar>
            <BookTravelForm
              isSaving={action.status === "executing"}
              onSubmit={action.execute}
              form={form}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer
      open={book}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setParams({ book: false });
        }
      }}
    >
      <DrawerContent className="p-6">
        <DrawerHeader className="mb-8 flex justify-between items-center flex-row">
          <h2 className="text-xl">Create Booking</h2>
        </DrawerHeader>

        <BookTravelForm
          isSaving={action.status === "executing"}
          onSubmit={action.execute}
          form={form}
        />
      </DrawerContent>
    </Drawer>
  );
}
