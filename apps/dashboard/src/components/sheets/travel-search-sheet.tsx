"use client";

import { searchTravelSchema } from "@/actions/schema";
import { searchTravelAction } from "@/actions/search-travel-action";
import { TravelSearchForm } from "@/components/forms/travel-search-form";
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

function SearchTypeDropdown({
  onSearchTypeChange,
}: {
  onSearchTypeChange: (type: "flights" | "stays") => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Icons.MoreVertical className="w-5 h-5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-42" sideOffset={10} align="end">
        <DropdownMenuItem onClick={() => onSearchTypeChange("flights")}>
          Search Flights
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSearchTypeChange("stays")}>
          Search Stays
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TravelSearchSheet({ userId, currency }: Props) {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { search, setParams } = useTravelParams();
  const [searchType, setSearchType] = useState<"flights" | "stays">("flights");

  const [queryParams, setQueryParams] = useQueryStates(
    searchType === "flights"
      ? {
          search_type: parseAsString.withDefault("flights"),
          travel_type: parseAsString.withDefault("return"),
          cabin_class: parseAsString.withDefault("economy"),
          passengers: parseAsJson<Array<{ type: string }>>().withDefault([
            { type: "adult" },
          ]),
          slices: parseAsJson<
            Array<{
              origin: string;
              destination: string;
              departure_date: string;
            }>
          >().withDefault([
            { origin: "", destination: "", departure_date: "" },
            { origin: "", destination: "", departure_date: "" },
          ]),
          bags: parseAsJson<{
            carry_on: number;
            cabin: number;
            checked: number;
          }>().withDefault({ carry_on: 0, cabin: 0, checked: 0 }),
        }
      : {
          search_type: parseAsString.withDefault("stays"),
          check_in_date: parseAsString.withDefault(""),
          check_out_date: parseAsString.withDefault(""),
          location: parseAsString.withDefault(""),
          rooms: parseAsInteger.withDefault(1),
          guests: parseAsJson<Array<{ type: string }>>().withDefault([
            { type: "adult" },
          ]),
        },
  );

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
        description: `Found ${data?.offersId?.length} options`,
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

  const handleSearchTypeChange = async (newType: "flights" | "stays") => {
    if (newType === "flights") {
      await setQueryParams({
        search_type: "flights",
        travel_type: "return",
        cabin_class: "economy",
        passengers: [{ type: "adult" }],
        slices: [
          { origin: "", destination: "", departure_date: "" },
          { origin: "", destination: "", departure_date: "" },
        ],
        bags: { carry_on: 0, cabin: 0, checked: 0 },
      });
    } else {
      await setQueryParams({
        search_type: "stays",
        check_in_date: "",
        check_out_date: "",
        location: "",
        rooms: 1,
        guests: [{ type: "adult" }],
      });
    }
    setSearchType(newType);
  };

  if (isDesktop) {
    return (
      <Sheet open={search} onOpenChange={(open) => setParams({ search: open })}>
        <SheetContent>
          <SheetHeader className="mb-8 flex justify-between items-center flex-row">
            <h2 className="text-xl">
              Search {searchType === "flights" ? "Flights" : "Stays"}
            </h2>
            <SearchTypeDropdown onSearchTypeChange={handleSearchTypeChange} />
          </SheetHeader>

          <ScrollArea className="h-full p-0 pb-28" hideScrollbar>
            <TravelSearchForm
              form={form}
              isSubmitting={searchAction.status === "executing"}
              onSubmit={searchAction.execute}
              onQueryParamsChange={(updates) => {
                const isFlights = searchType === "flights";
                setQueryParams((prev) => ({
                  ...prev,
                  ...(isFlights
                    ? {
                        travel_type: updates.travel_type ?? prev.travel_type,
                        cabin_class: updates.cabin_class ?? prev.cabin_class,
                        passengers: updates.passengers ?? prev.passengers,
                        slices: updates.slices ?? prev.slices,
                        bags: updates.bags ?? prev.bags,
                      }
                    : {
                        check_in_date:
                          updates.check_in_date ?? prev.check_in_date,
                        check_out_date:
                          updates.check_out_date ?? prev.check_out_date,
                        location: updates.location ?? prev.location,
                        rooms: updates.rooms ?? prev.rooms,
                        guests: updates.guests ?? prev.guests,
                      }),
                }));
              }}
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
          <SearchTypeDropdown onSearchTypeChange={handleSearchTypeChange} />
        </DrawerHeader>

        <SearchTravelForm
          form={form}
          isSubmitting={searchAction.status === "executing"}
          onSubmit={searchAction.execute}
          onQueryParamsChange={(updates) => {
            const isFlights = searchType === "flights";
            setQueryParams((prev) => ({
              ...prev,
              ...(isFlights
                ? {
                    travel_type: updates.travel_type ?? prev.travel_type,
                    cabin_class: updates.cabin_class ?? prev.cabin_class,
                    passengers: updates.passengers ?? prev.passengers,
                    slices: updates.slices ?? prev.slices,
                    bags: updates.bags ?? prev.bags,
                  }
                : {
                    check_in_date: updates.check_in_date ?? prev.check_in_date,
                    check_out_date:
                      updates.check_out_date ?? prev.check_out_date,
                    location: updates.location ?? prev.location,
                    rooms: updates.rooms ?? prev.rooms,
                    guests: updates.guests ?? prev.guests,
                  }),
            }));
          }}
          searchType={searchType}
          defaultValues={form.getValues()}
        />
      </DrawerContent>
    </Drawer>
  );
}
