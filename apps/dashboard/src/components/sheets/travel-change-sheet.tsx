"use client";

import { changeTravelAction } from "@/actions/change-travel-action";
import { changeTravelSchema } from "@/actions/schema";
import { ChangeTravelForm } from "@/components/forms/travel-change-form";
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

export function ChangeTravelSheet({ userId, currency }: Props) {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { change, setParams } = useTravelParams();

  const form = useForm<z.infer<typeof changeTravelSchema>>({
    resolver: zodResolver(changeTravelSchema),
    defaultValues: {
      user_id: userId,
      currency,
    },
  });

  const action = useAction(changeTravelAction, {
    onSuccess: (data) => {
      toast({
        title: `${data.data?.type === "flights" ? "Flight" : "Stay"} Change Requested`,
        description: "Your change request has been submitted.",
        variant: "success",
      });
      setParams({ change: false });
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
      <Sheet open={change} onOpenChange={(open) => setParams({ change: open })}>
        <SheetContent>
          <SheetHeader className="mb-8 flex justify-between items-center flex-row">
            <h2 className="text-xl">Change or Cancel Booking</h2>
          </SheetHeader>

          <ScrollArea className="h-full p-0 pb-28" hideScrollbar>
            <ChangeTravelForm
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
      open={change}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setParams({ change: false });
        }
      }}
    >
      <DrawerContent className="p-6">
        <DrawerHeader className="mb-8 flex justify-between items-center flex-row">
          <h2 className="text-xl">Change or Cancel Booking</h2>
        </DrawerHeader>

        <ChangeTravelForm
          isSaving={action.status === "executing"}
          onSubmit={action.execute}
          form={form}
        />
      </DrawerContent>
    </Drawer>
  );
}
