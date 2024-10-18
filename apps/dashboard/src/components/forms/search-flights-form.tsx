"use client";

import { createOfferRequestAction } from "@/actions/travel/flights/create-offer-request-action";
import { createPartialOfferRequestAction } from "@/actions/travel/flights/create-partial-offer-request-action";
import { createOfferRequestSchema } from "@/actions/travel/schema";
import { TravelCabin } from "@/components/travel/travel-cabin";
import { TravelLocation } from "@/components/travel/travel-location";
import { TravelLuggage } from "@/components/travel/travel-luggage";
import { TravelPassenger } from "@/components/travel/travel-passenger";
import { TravelPeriod } from "@/components/travel/travel-period";
import { TravelType } from "@/components/travel/travel-type";
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
import { addDays, formatISO, startOfDay } from "date-fns";
import { useAction } from "next-safe-action/hooks";
import { parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SearchFlightsForm() {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const today = startOfDay(new Date());
  // const defaultDepartureDate = formatISO(today, { representation: "date" });
  // const defaultReturnDate = formatISO(addDays(today, 7), {
  //   representation: "date",
  // });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      origin: parseAsString,
      destination: parseAsString,
      departureDate: parseAsString,
      returnDate: parseAsString,
      tripType: parseAsString,
      cabinClass: parseAsString,
      passengers: parseAsString,
    },
    { history: "push" },
  );

  const createOfferRequest = useAction(createOfferRequestAction, {
    onSuccess: ({ data: offerRequest }) => {
      onCreate?.(offerRequest);
      handleSelect(offerRequest);
    },
    onError: () => {
      toast({
        duration: 3500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
  });

  const createPartialOfferRequest = useAction(createPartialOfferRequestAction, {
    onSuccess: ({ data: offerRequest }) => {
      onCreate?.(offerRequest);
      handleSelect(offerRequest);
    },
    onError: () => {
      toast({
        duration: 3500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
  });

  const stopSearch = () => {
    setIsSearching(false);
    toast({
      duration: 3500,
      variant: "success",
      title: "Search stopped",
      description: "The search has been cancelled.",
    });
  };

  const addFlightSegment = () => {
    const currentSlices = form.getValues("slices");
    form.setValue("slices", [
      ...currentSlices,
      { origin: "", destination: "", departure_date: "" },
    ]);
  };

  const removeFlightSegment = (index: number) => {
    const currentSlices = form.getValues("slices");
    if (currentSlices.length > 1) {
      form.setValue(
        "slices",
        currentSlices.filter((_, i) => i !== index),
      );
    }
  };

  const form = useForm({
    resolver: zodResolver(createOfferRequestSchema),
    defaultValues: {
      slices: [
        {
          origin: queryParams.origin || "",
          destination: queryParams.destination || "",
          departure_date: queryParams.departureDate || "",
        },
        {
          origin: queryParams.destination || "",
          destination: queryParams.origin || "",
          departure_date: queryParams.returnDate || "",
        },
      ],
      passengers: JSON.parse(
        queryParams.passengers ||
          '{"adult":1,"child":0,"infant_without_seat":0}',
      ),
      cabin_class: queryParams.cabinClass || "economy",
      tripType: queryParams.tripType || "return",
      bags: { cabin: 0, checked: 0 },
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    setQueryParams({
      origin: data?.slices[0]?.origin,
      destination: data?.slices[0]?.destination,
      departureDate: data?.slices[0]?.departure_date,
      returnDate: data?.slices[1]?.departure_date,
      tripType: data?.tripType,
      cabinClass: data?.cabin_class,
      passengers: JSON.stringify(data?.passengers),
    });
    createOfferRequest.execute(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 mx-auto max-w-4xl">
          <FormField
            control={form.control}
            name="tripType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TravelType
                    initialValue={field.value}
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
            name="cabin_class"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TravelCabin
                    initialValue={field.value}
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
                  <TravelPassenger
                    initialValue={field.value}
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
                  <TravelLuggage
                    initialValue={field.value}
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4 mx-auto max-w-4xl">
          {form.watch("tripType") === "multi_city" ? (
            form.watch("slices").map((slice, index) => (
              <div
                key={slice.departure_date}
                className="col-span-full grid grid-cols-1 md:grid-cols-5 gap-4"
              >
                <FormField
                  control={form.control}
                  name={`slices.${index}.origin`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <LocationSelector
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
                  name={`slices.${index}.destination`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <LocationSelector
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
                  name={`slices.${index}.departure_date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TravelPeriod
                          defaultValue={{
                            from: field.value,
                            to: field.value,
                          }}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      index === form.watch("slices").length - 1
                        ? addFlightSegment()
                        : removeFlightSegment(index)
                    }
                    className="w-10 h-10"
                  >
                    {index === form.watch("slices").length - 1 ? (
                      <Icons.Plus className="h-4 w-4" />
                    ) : (
                      <Icons.Close className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {index === form.watch("slices").length - 1 && (
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isSearching}
                    onClick={isSearching ? stopSearch : undefined}
                    className="w-10 h-10"
                  >
                    {createOfferRequest.status === "executing" ? (
                      <Icons.Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.Travel className="h-4 w-4" />
                    )}
                  </Button>
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
                        to: field.value,
                      }}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SubmitButton isSubmitting={isSearching} className="w-full">
                Search
              </SubmitButton>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
