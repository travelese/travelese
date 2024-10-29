"use client";

import { createOfferRequestAction } from "@/actions/create-offer-request-action";
import { createPartialOfferRequestAction } from "@/actions/create-partial-offer-request-action";
import { createOfferRequestSchema } from "@/actions/schema";
import { TravelBaggage } from "@/components/travel-baggage";
import { TravelCabin } from "@/components/travel-cabin";
import { TravelLocation } from "@/components/travel-location";
import { TravelPeriod } from "@/components/travel-period";
import { TravelTraveller } from "@/components/travel-traveller";
import { TravelType } from "@/components/travel-type";
import type { OfferRequest } from "@duffel/api/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@travelese/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@travelese/ui/form";
import { Icons } from "@travelese/ui/icons";
import { SubmitButton } from "@travelese/ui/submit-button";
import { useToast } from "@travelese/ui/use-toast";
import { useAction } from "next-safe-action/hooks";
import {
  parseAsArrayOf,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export function SearchFlightsForm() {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const [travelType] = useQueryState("travel_type");
  const [queryParams, setQueryParams] = useQueryStates(
    {
      index: parseAsArrayOf(parseAsString),
      origin: parseAsArrayOf(parseAsString),
      destination: parseAsArrayOf(parseAsString),
      from: parseAsArrayOf(parseAsString),
      to: parseAsArrayOf(parseAsString),
      cabinClass: parseAsString,
      passengers: parseAsString,
    },
    { history: "push" },
  );

  const createOfferRequest = useAction(createOfferRequestAction, {
    onSuccess: ({ data: offerRequest }) => {
      toast({
        duration: 3500,
        title: "Search completed",
        description: "The search has been completed.",
        variant: "success",
      });
      onCreate?.(offerRequest as OfferRequest);
    },
    onError: () => {
      toast({
        duration: 3500,
        title: "Something went wrong please try again.",
        variant: "error",
      });
    },
  });

  const createPartialOfferRequest = useAction(createPartialOfferRequestAction, {
    onSuccess: ({ data: offerRequest }) => {
      toast({
        duration: 3500,
        title: "Search completed",
        description: "The search has been completed.",
        variant: "success",
      });
      onCreate?.(offerRequest as OfferRequest);
    },
    onError: () => {
      toast({
        duration: 3500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(createOfferRequestSchema),
    defaultValues: {
      slices: [],
      passengers: [{ type: "adult" }],
      cabinClass: queryParams.cabinClass || "economy",
      travelType: travelType || "one_way",
      bags: { carry_on: 0, cabin: 0, checked: 0 },
    },
  });

  useEffect(() => {
    const slices = [];
    const origins = queryParams.origin || [];
    const destinations = queryParams.destination || [];
    const fromDates = queryParams.from || [];
    const toDates = queryParams.to || [];

    if (travelType === "multi_city") {
      for (
        let i = 0;
        i < Math.max(origins.length, destinations.length, fromDates.length);
        i++
      ) {
        slices.push({
          index: i,
          origin: origins[i] || "",
          destination: destinations[i] || "",
          departure_date: fromDates[i] || "",
        });
      }
    } else if (travelType === "return") {
      slices.push({
        index: 0,
        origin: origins[0] || "",
        destination: destinations[0] || "",
        departure_date: fromDates[0] || "",
        return_date: toDates[0] || "",
      });
    } else {
      // one_way
      slices.push({
        index: 0,
        origin: origins[0] || "",
        destination: destinations[0] || "",
        departure_date: fromDates[0] || "",
      });
    }

    form.setValue("slices", slices);
    form.setValue("travelType", travelType || "one_way");
  }, [queryParams, travelType, form]);

  const addFlightSegment = () => {
    const currentSlices = form.getValues("slices");
    if (currentSlices.length < 3) {
      form.setValue("slices", [
        ...currentSlices,
        {
          index: currentSlices.length,
          origin: "",
          destination: "",
          departure_date: "",
        },
      ]);
    }
  };

  const removeFlightSegment = (indexToRemove: number) => {
    const currentSlices = form.getValues("slices");
    if (currentSlices.length > 1) {
      const newSlices = currentSlices
        .filter((slice) => slice.index !== indexToRemove)
        .map((slice, i) => ({ ...slice, index: i }));
      form.setValue("slices", newSlices);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          if (data.travelType === "multi_city") {
            createPartialOfferRequest.execute(data);
          } else {
            createOfferRequest.execute(data);
          }
        })}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 mx-auto max-w-4xl">
          <FormField
            control={form.control}
            name="travelType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TravelType
                    {...field}
                    defaultValue={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (value === "one_way") {
                        form.setValue("slices", [
                          {
                            index: 0,
                            origin: "",
                            destination: "",
                            departure_date: "",
                          },
                        ]);
                      } else if (value === "return") {
                        form.setValue("slices", [
                          {
                            index: 0,
                            origin: "",
                            destination: "",
                            departure_date: "",
                            return_date: "",
                          },
                        ]);
                      } else if (value === "multi_city") {
                        form.setValue("slices", [
                          {
                            index: 0,
                            origin: "",
                            destination: "",
                            departure_date: "",
                          },
                          {
                            index: 1,
                            origin: "",
                            destination: "",
                            departure_date: "",
                          },
                        ]);
                      }
                    }}
                    disabled={isSearching}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cabinClass"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TravelCabin
                    defaultValue={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    disabled={isSearching}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passengers"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TravelTraveller
                    defaultValue={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    disabled={isSearching}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bags"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TravelBaggage
                    defaultValue={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    disabled={isSearching}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 mx-auto max-w-4xl">
          {form.watch("slices").map((slice) => (
            <div
              key={slice.index}
              className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-2"
            >
              <FormField
                control={form.control}
                name={`slices.${slice.index}.origin`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TravelLocation
                        type="origin"
                        placeholder="Origin"
                        value={field.value}
                        onChange={(value, iataCode) => {
                          field.onChange(iataCode);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`slices.${slice.index}.destination`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TravelLocation
                        type="destination"
                        placeholder="Destination"
                        value={field.value}
                        onChange={(value, iataCode) => {
                          field.onChange(iataCode);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`slices.${slice.index}.departure_date`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TravelPeriod
                        defaultValue={{
                          from: field.value,
                          to: slice.return_date || field.value,
                        }}
                        onChange={(value) => {
                          field.onChange(value.from);
                          if (
                            form.watch("travelType") === "return" &&
                            slice.index === 0
                          ) {
                            form.setValue("slices.0.return_date", value.to);
                          }
                        }}
                        isRange={
                          form.watch("travelType") === "return" &&
                          slice.index === 0
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("travelType") === "multi_city" && (
                <div className="flex space-x-1">
                  {slice.index > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => removeFlightSegment(slice.index)}
                      className="w-10 h-10 flex-1"
                    >
                      <Icons.Close className="h-4 w-4" />
                    </Button>
                  )}
                  {slice.index === form.watch("slices").length - 1 &&
                    form.watch("slices").length < 3 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={addFlightSegment}
                        className="w-10 h-10 flex-1"
                      >
                        <Icons.Plus className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              )}
            </div>
          ))}

          <SubmitButton
            isSubmitting={
              createOfferRequest.isExecuting ||
              createPartialOfferRequest.isExecuting
            }
            className="w-full col-span-full"
          >
            Search
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
}
