"use client";

import { createOfferRequestAction } from "@/actions/travel/create-offer-request-action";
import { createPartialOfferRequestAction } from "@/actions/travel/create-partial-offer-request-action";
import { listOffersAction } from "@/actions/travel/list-offers-action";
import { createOfferRequestSchema } from "@/actions/travel/schema";
import { TravelBaggage } from "@/components/travel/travel-baggage";
import { TravelCabin } from "@/components/travel/travel-cabin";
import { TravelLocation } from "@/components/travel/travel-location";
import { TravelPeriod } from "@/components/travel/travel-period";
import { TravelTraveller } from "@/components/travel/travel-traveller";
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
import { useAction } from "next-safe-action/hooks";
import { parseAsJson, parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function SearchFlightsForm({
  userId,
  currency,
  onCreate,
}: {
  userId: string;
  currency: string;
  onCreate: (listOffersId: string) => void;
}) {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const [queryParams, setQueryParams] = useQueryStates(
    {
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
      currency: parseAsString.withDefault("USD"),
    },
    { history: "push" },
  );

  const listOffers = useAction(listOffersAction, {
    onSuccess: ({ data: offers }) => {
      onCreate(listOffersId);

      toast({
        title: "Flights Found",
        description: `Found ${offers.length} flight options`,
        variant: "success",
      });
    },
  });

  const createOfferRequest = useAction(createOfferRequestAction, {
    onSuccess: ({ data: offerRequest }) => {
      onCreate(offerRequest?.id);

      toast({
        title: "Offer Request Created",
        description: `Offer Request ID: ${offerRequest?.id}`,
        variant: "success",
      });

      listOffers.execute({ offer_request_id: offerRequest.id });
    },
  });

  const createPartialOfferRequest = useAction(createPartialOfferRequestAction, {
    onSuccess: ({ data: offerRequest }) => {
      onCreate(offerRequest?.id);

      toast({
        title: "Offer Request Created",
        description: `Offer Request ID: ${offerRequest?.id}`,
        variant: "success",
      });

      listOffers.execute({ offer_request_id: offerRequest.id });
    },
  });

  const addFlightSegment = () => {
    const currentSlices = form.getValues("slices");
    if (currentSlices.length < 3) {
      const newSlice = { origin: "", destination: "", departure_date: "" };
      form.setValue("slices", [...currentSlices, newSlice]);
      setQueryParams((prev) => ({
        ...prev,
        slices: [...prev.slices, newSlice],
      }));
    }
  };

  const removeFlightSegment = (indexToRemove: number) => {
    const currentSlices = form.getValues("slices");
    if (currentSlices.length > 1) {
      const newSlices = currentSlices.filter(
        (_, index) => index !== indexToRemove,
      );
      form.setValue("slices", newSlices);
      setQueryParams((prev) => ({
        ...prev,
        slices: newSlices,
      }));
    }
  };

  const form = useForm({
    resolver: zodResolver(createOfferRequestSchema),
    defaultValues: {
      slices: queryParams.slices,
      passengers: queryParams.passengers,
      cabin_class: queryParams.cabin_class,
      travel_type: queryParams.travel_type,
      bags: { carry_on: 0, cabin: 0, checked: 0 },
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          if (data.travel_type === "multi_city") {
            createPartialOfferRequest.execute(data);
          } else {
            createOfferRequest.execute(data);
          }
        })}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 mx-auto max-w-4xl">
          <FormField
            control={form.control}
            name="travel_type"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TravelType
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setQueryParams((prev) => ({
                        ...prev,
                        travel_type: value,
                      }));

                      const currentSlices = form.getValues("slices");
                      let newSlices;

                      if (value === "return") {
                        newSlices = [
                          currentSlices[0] || {
                            origin: "",
                            destination: "",
                            departure_date: "",
                          },
                          {
                            origin: currentSlices[0]?.destination || "",
                            destination: currentSlices[0]?.origin || "",
                            departure_date: "",
                          },
                        ];
                      } else if (value === "one_way") {
                        newSlices = [
                          currentSlices[0] || {
                            origin: "",
                            destination: "",
                            departure_date: "",
                          },
                        ];
                      } else if (value === "multi_city") {
                        newSlices =
                          currentSlices.length < 2
                            ? [
                                ...currentSlices,
                                {
                                  origin: "",
                                  destination: "",
                                  departure_date: "",
                                },
                              ]
                            : currentSlices;
                      }

                      form.setValue("slices", newSlices);
                      setQueryParams((prev) => ({
                        ...prev,
                        slices: newSlices,
                      }));
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
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setQueryParams((prev) => ({
                        ...prev,
                        cabin_class: value,
                      }));
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
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setQueryParams((prev) => ({
                        ...prev,
                        passengers: value,
                      }));
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
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setQueryParams((prev) => ({
                        ...prev,
                        travel_baggage: value,
                      }));
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
          {form.watch("slices").map((slice, index) => (
            <div
              key={index}
              className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-2"
            >
              {(form.watch("travel_type") === "multi_city" || index === 0) && (
                <>
                  <FormField
                    control={form.control}
                    name={`slices.${index}.origin`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TravelLocation
                            type="origin"
                            placeholder="Origin"
                            value={field.value}
                            onChange={(value, iataCode) => {
                              field.onChange(iataCode);
                              setQueryParams((prev) => ({
                                ...prev,
                                slices: prev.slices.map((s, i) =>
                                  i === index ? { ...s, origin: iataCode } : s,
                                ),
                              }));
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
                          <TravelLocation
                            type="destination"
                            placeholder="Destination"
                            value={field.value}
                            onChange={(value, iataCode) => {
                              field.onChange(iataCode);
                              setQueryParams((prev) => ({
                                ...prev,
                                slices: prev.slices.map((s, i) =>
                                  i === index
                                    ? { ...s, destination: iataCode }
                                    : s,
                                ),
                              }));
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
                            value={{
                              from: field.value,
                              to:
                                form.watch("travel_type") === "return" &&
                                index === 0
                                  ? form.watch(
                                      `slices.${index + 1}.departure_date`,
                                    )
                                  : undefined,
                            }}
                            travelType={form.watch("travel_type")}
                            index={index}
                            onChange={(value) => {
                              field.onChange(value.from);
                              setQueryParams((prev) => ({
                                ...prev,
                                slices: prev.slices.map((s, i) =>
                                  i === index
                                    ? { ...s, departure_date: value.from }
                                    : form.watch("travel_type") === "return" &&
                                        i === index + 1 &&
                                        value.to
                                      ? {
                                          ...s,
                                          departure_date: value.to,
                                          origin: form.getValues(
                                            `slices.${index}.destination`,
                                          ),
                                          destination: form.getValues(
                                            `slices.${index}.origin`,
                                          ),
                                        }
                                      : s,
                                ),
                              }));
                              if (
                                value.to &&
                                index === 0 &&
                                form.watch("travel_type") === "return"
                              ) {
                                const firstSlice = form.getValues(
                                  `slices.${index}`,
                                );
                                form.setValue(`slices.${index + 1}`, {
                                  departure_date: value.to,
                                  origin: firstSlice.destination,
                                  destination: firstSlice.origin,
                                });
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("travel_type") === "multi_city" &&
                    index === form.watch("slices").length - 1 && (
                      <div className="flex space-x-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => removeFlightSegment(index)}
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
                        <SubmitButton
                          isSubmitting={
                            createOfferRequest.isExecuting ||
                            createPartialOfferRequest.isExecuting
                          }
                          className="w-full"
                          size="icon"
                        >
                          <Icons.Travel className="h-4 w-4" />
                        </SubmitButton>
                      </div>
                    )}

                  {((form.watch("travel_type") !== "multi_city" &&
                    index === form.watch("slices").length - 1) ||
                    (form.watch("travel_type") === "return" &&
                      index === 0)) && (
                    <SubmitButton
                      isSubmitting={
                        createOfferRequest.isExecuting ||
                        createPartialOfferRequest.isExecuting
                      }
                      className="w-full"
                    >
                      Search
                    </SubmitButton>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </form>
    </Form>
  );
}
