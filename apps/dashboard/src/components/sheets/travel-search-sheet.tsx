"use client";

import { searchTravelSchema } from "@/actions/schema";
import { searchTravelAction } from "@/actions/search-travel-action";
import { SearchTravelForm } from "@/components/forms/travel-search-form";
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
import {
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryStates,
} from "nuqs";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type Props = {
  userId: string;
  currency: string;
};

export function SearchTravelSheet({ userId, currency }: Props) {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { search, setParams } = useTravelParams();
  const [searchType, setSearchType] = useState<"flights" | "stays">("flights");

  const [queryParams, setQueryParams] = useQueryStates({
    search_type: parseAsString.withDefault("flights"),
    // Flights params
    travel_type: parseAsString.withDefault("return"),
    cabin_class: parseAsString.withDefault("economy"),
    passengers: parseAsJson<Array<{ type: string }>>().withDefault([
      { type: "adult" },
    ]),
    slices: parseAsJson<
      Array<{ origin: string; destination: string; departure_date: string }>
    >().withDefault([
      { origin: "", destination: "", departure_date: "" },
      { origin: "", destination: "", departure_date: "" },
    ]),
    bags: parseAsJson<{
      carry_on: number;
      cabin: number;
      checked: number;
    }>().withDefault({ carry_on: 0, cabin: 0, checked: 0 }),
    // Stays params
    check_in_date: parseAsString.withDefault(""),
    check_out_date: parseAsString.withDefault(""),
    location: parseAsString.withDefault(""),
    rooms: parseAsInteger.withDefault(1),
    guests: parseAsJson<Array<{ type: string; age?: number }>>().withDefault([
      { type: "adult" },
    ]),
  });

  const form = useForm<z.infer<typeof searchTravelSchema>>({
    resolver: zodResolver(searchTravelSchema),
    defaultValues: {
      user_id: userId,
      currency,
      search_type: searchType,
      ...(searchType === "flights"
        ? {
            travel_type: queryParams.travel_type,
            cabin_class: queryParams.cabin_class,
            passengers: queryParams.passengers,
            slices: queryParams.slices,
            bags: queryParams.bags,
          }
        : {
            check_in_date: queryParams.check_in_date,
            check_out_date: queryParams.check_out_date,
            location: queryParams.location,
            rooms: queryParams.rooms,
            guests: queryParams.guests,
          }),
    },
  });

  const searchAction = useAction(searchTravelAction, {
    onSuccess: ({ data }) => {
      toast({
        title: `${data?.type === "flights" ? "Flights" : "Stays"} Found`,
        description: `Found ${data?.data?.length} options`,
        variant: "success",
      });
      setParams({ search: false });
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
      <Sheet open={search} onOpenChange={(open) => setParams({ search: open })}>
        <SheetContent>
          <SheetHeader className="mb-8 flex justify-between items-center flex-row">
            <h2 className="text-xl">
              Search {searchType === "flights" ? "Flights" : "Stays"}
            </h2>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Icons.MoreVertical className="w-5 h-5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-42" sideOffset={10} align="end">
                <DropdownMenuItem onClick={() => setSearchType("flights")}>
                  Search Flights
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchType("stays")}>
                  Search Stays
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SheetHeader>

          <ScrollArea className="h-full p-0 pb-28" hideScrollbar>
            <SearchTravelForm
              form={form}
              isSubmitting={searchAction.status === "executing"}
              onSubmit={searchAction.execute}
              onQueryParamsChange={(updates) =>
                setQueryParams((prev) => ({ ...prev, ...updates }))
              }
              searchType={searchType}
              defaultValues={form.getValues()}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer
      open={search}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setParams({ search: false });
        }
      }}
    >
      <DrawerContent className="p-6">
        <DrawerHeader className="mb-8 flex justify-between items-center flex-row">
          <h2 className="text-xl">
            Search {searchType === "flights" ? "Flights" : "Stays"}
          </h2>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Icons.MoreVertical className="w-5 h-5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-42" sideOffset={10} align="end">
              <DropdownMenuItem onClick={() => setSearchType("flights")}>
                Search Flights
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchType("stays")}>
                Search Stays
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DrawerHeader>

        <SearchTravelForm
          form={form}
          isSubmitting={searchAction.status === "executing"}
          onSubmit={searchAction.execute}
          onQueryParamsChange={(updates) =>
            setQueryParams((prev) => ({ ...prev, ...updates }))
          }
          searchType={searchType}
          defaultValues={form.getValues()}
        />
      </DrawerContent>
    </Drawer>
  );
}
