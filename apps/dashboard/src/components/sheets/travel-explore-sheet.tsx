"use client";

import { exploreTravelAction } from "@/actions/explore-travel-action";
import { exploreTravelSchema } from "@/actions/schema";
import { ExploreTravelForm } from "@/components/forms/travel-explore-form";
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
import { parseAsString, useQueryStates } from "nuqs";
import React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type Props = {
  userId: string;
  currency: string;
};

export function ExploreTravelSheet({ userId, currency }: Props) {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { explore, setParams } = useTravelParams();

  const [queryParams, setQueryParams] = useQueryStates({
    explore: parseAsString.withDefault(""),
  });

  const form = useForm<z.infer<typeof exploreTravelSchema>>({
    resolver: zodResolver(exploreTravelSchema),
    defaultValues: {
      user_id: userId,
      explore: queryParams.explore,
    },
  });

  const exploreAction = useAction(exploreTravelAction, {
    onSuccess: ({ data }) => {
      toast({
        title: "Explore Found",
        description: "Found 10 options",
        variant: "success",
      });
      setParams({ explore: false });
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
      <Sheet
        open={explore}
        onOpenChange={(open) => setParams({ explore: open })}
      >
        <SheetContent>
          <SheetHeader className="mb-8 flex justify-between items-center flex-row">
            <h2 className="text-xl">Explore Flights</h2>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Icons.MoreVertical className="w-5 h-5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-42" sideOffset={10} align="end">
                <DropdownMenuItem onClick={() => setParams({ explore: true })}>
                  Explore Flights
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SheetHeader>

          <ScrollArea className="h-full p-0 pb-28" hideScrollbar>
            <ExploreTravelForm
              form={form}
              isSubmitting={exploreAction.status === "executing"}
              onSubmit={exploreAction.execute}
              onQueryParamsChange={(updates) =>
                setQueryParams((prev) => ({ ...prev, ...updates }))
              }
              defaultValues={form.getValues()}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer
      open={explore}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setParams({ explore: false });
        }
      }}
    >
      <DrawerContent className="p-6">
        <DrawerHeader className="mb-8 flex justify-between items-center flex-row">
          <h2 className="text-xl">Explore Flights</h2>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Icons.MoreVertical className="w-5 h-5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-42" sideOffset={10} align="end">
              <DropdownMenuItem onClick={() => setParams({ explore: true })}>
                Explore Flights
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DrawerHeader>

        <ExploreTravelForm
          form={form}
          isSubmitting={exploreAction.status === "executing"}
          onSubmit={exploreAction.execute}
          onQueryParamsChange={(updates) =>
            setQueryParams((prev) => ({ ...prev, ...updates }))
          }
          defaultValues={form.getValues()}
        />
      </DrawerContent>
    </Drawer>
  );
}
