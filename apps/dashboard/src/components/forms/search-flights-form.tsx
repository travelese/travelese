"use client";

import { createOfferRequestAction } from "@/actions/travel/create-offer-request-action";
import { createPartialOfferRequestAction } from "@/actions/travel/create-partial-offer-request-action";
import { createOfferRequestSchema } from "@/actions/travel/schema";
import { TravelCabin } from "@/components/travel/travel-cabin";
import { TravelLocation } from "@/components/travel/travel-location";
import { TravelBaggage } from "@/components/travel/travel-baggage";
import { TravelPeriod } from "@/components/travel/travel-period";
import { TravelTraveller } from "@/components/travel/travel-traveller";
import { TravelType } from "@/components/travel/travel-type";
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
import { parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function SearchFlightsForm() {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const [queryParams, setQueryParams] = useQueryStates(
    {
      origin: parseAsString,
      destination: parseAsString,
      departureDate: parseAsString,
      returnDate: parseAsString,
      travelType: parseAsString,
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

  const form = useForm({
    resolver: zodResolver(createOfferRequestSchema),
    defaultValues: {
      slices: [
        {
          index: 0,
          origin: queryParams.origin || "",
          destination: queryParams.destination || "",
          departure_date: queryParams.departureDate || "",
        },
      ],
      passengers: [{ type: "adult" }],
      cabinClass: queryParams.cabinClass || "economy",
      travelType: queryParams.travelType || "return",
      bags: { carry_on: 0, cabin: 0, checked: 0 },
    },
  });

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
                      } else if (
                        value === "return" &&
                        form.getValues("slices").length === 1
                      ) {
                        form.setValue("slices", [
                          ...form.getValues("slices"),
                          {
                            index: 1,
                            origin: "",
                            destination: "",
                            departure_date: "",
                          },
                        ]);
                      } else if (
                        value === "multi_city" &&
                        form.getValues("slices").length < 2
                      ) {
                        form.setValue("slices", [
                          ...form.getValues("slices"),
                          {
                            index: form.getValues("slices").length,
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
          {form.watch("travelType") === "multi_city" ? (
            form.watch("slices").map((slice) => (
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
                            to: field.value, // Keep this for range
                          }}
                          travelType={form.watch("travelType")} // Pass travelType
                          onChange={(value) => {
                            field.onChange(value.from); // Handle single date logic
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {slice.index === form.watch("slices").length - 1 && (
                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => removeFlightSegment(slice.index)}
                      disabled={form.watch("slices").length <= 1}
                      className="w-10 h-10 flex-1"
                    >
                      <Icons.Close className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={addFlightSegment}
                      disabled={form.watch("slices").length >= 3}
                      className="w-10 h-10 flex-1"
                    >
                      <Icons.Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isSearching}
                      onClick={isSearching ? stopSearch : undefined}
                      className="w-10 h-10 flex-1"
                    >
                      {createPartialOfferRequest.status === "executing" ? (
                        <Icons.Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icons.Travel className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <>
              <FormField
                control={form.control}
                name="slices.0.origin"
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
                name="slices.0.destination"
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
                name="slices.0.departure_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <TravelPeriod
                      defaultValue={{
                        from: field.value,
                        to: field.value, // Keep this for range
                      }}
                      travelType={form.watch("travelType")} // Pass travelType
                      onChange={(value) => {
                        field.onChange(value.from); // Handle single date logic
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SubmitButton
                isSubmitting={
                  createOfferRequest.isExecuting ||
                  createPartialOfferRequest.isExecuting
                }
                className="w-full"
              >
                Search
              </SubmitButton>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
