"use client";

import { changeTravelAction } from "@/actions/travel/change-travel-action";
import { changeTravelSchema } from "@/actions/schema";
import { TravelChangeForm } from "@/components/forms/travel-change-form";
import { useTravelParams } from "@/hooks/use-travel-params";
import { zodResolver } from "@hookform/resolvers/zod";
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
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type Props = {
  userId: string;
  currency: string;
};

export function TravelChangeSheet({ userId, currency }: Props) {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { change, setParams } = useTravelParams();
  const [changeType, setChangeType] = useState<"flights" | "stays">("flights");

  const form = useForm<z.infer<typeof changeTravelSchema>>({
    resolver: zodResolver(changeTravelSchema),
    defaultValues: {
      user_id: userId,
      currency,
    },
  });

  const changeAction = useAction(changeTravelAction, {
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
            <h2 className="text-xl">
              Change {changeType === "flights" ? "Flights" : "Stays"}
            </h2>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Icons.MoreVertical className="w-5 h-5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-42" sideOffset={10} align="end">
                <DropdownMenuItem onClick={() => setChangeType("flights")}>
                  Change Flights
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChangeType("stays")}>
                  Change Stays
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SheetHeader>

          <ScrollArea className="h-full p-0 pb-28" hideScrollbar>
            <TravelChangeForm
              form={form}
              isSaving={changeAction.status === "executing"}
              onSubmit={changeAction.execute}
              changeType={changeType}
              defaultValues={form.getValues()}
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
          <h2 className="text-xl">
            Change {changeType === "flights" ? "Flights" : "Stays"}
          </h2>
        </DrawerHeader>

        <ChangeTravelForm
          form={form}
          isSaving={changeAction.status === "executing"}
          onSubmit={changeAction.execute}
          changeType={changeType}
          defaultValues={form.getValues()}
        />
      </DrawerContent>
    </Drawer>
  );
}
