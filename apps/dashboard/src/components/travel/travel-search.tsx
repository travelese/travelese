"use client";

import { TravelSearchForm } from "@/components/forms/travel-search-form";
import { searchTravelSchema } from "@/actions/schema";
import { searchTravelAction } from "@/actions/travel/search-travel-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useState } from "react";
import { useToast } from "@travelese/ui/use-toast";
import { useAction } from "next-safe-action/hooks";

type Props = {
  userData?: {
    id?: string;
    currency?: string;
  };
  data: any;
  meta: any;
};

export function TravelSearch({
  userData,
  data,
  meta,
}: Props) {
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<"flights" | "stays">("flights");

  const form = useForm<z.infer<typeof searchTravelSchema>>({
    resolver: zodResolver(searchTravelSchema),
    defaultValues: {
      user_id: userData?.id,
      currency: userData?.currency,
      search_type: searchType,
      travel_type: "return",
      cabin_class: "economy",
      passengers: [{ type: "adult" }],
      slices: [
        { origin: "", destination: "", departure_date: "" },
        { origin: "", destination: "", departure_date: "" },
      ],
    },
  });

  const searchAction = useAction(searchTravelAction, {
    onSuccess: ({ data }) => {
      toast({
        title: `${data?.type === "flights" ? "Flights" : "Stays"} Found`,
        description: `Found ${data?.offersId?.length} options`,
        variant: "success",
      });
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

  const handleSearchTypeChange = (type: "flights" | "stays") => {
    setSearchType(type);
    form.reset({
      user_id: userData?.id,
      currency: userData?.currency,
      search_type: type,
      ...(type === "flights"
        ? {
            travel_type: "return",
            cabin_class: "economy",
            passengers: [{ type: "adult" }],
            slices: [
              { origin: "", destination: "", departure_date: "" },
              { origin: "", destination: "", departure_date: "" },
            ],
          }
        : {
            check_in_date: "",
            check_out_date: "",
            location: "",
            rooms: 1,
            guests: [{ type: "adult" }],
          }),
    });
  };

  return (
    <div>
      <TravelSearchForm
        form={form}
        isSubmitting={searchAction.status === "executing"}
        onSubmit={searchAction.execute}
        onQueryParamsChange={() => {}}
        searchType={searchType}
        defaultValues={form.getValues()}
      />
    </div>
  );
}

