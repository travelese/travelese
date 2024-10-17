"use client";

import {
  CABIN_CLASSES,
  DUFFEL_PASSENGER_TYPES,
  TRAVEL_TYPES,
} from "@/actions/travel/constants";
import { createOfferRequestAction } from "@/actions/travel/flights/create-offer-request-action";
import { createPartialOfferRequestAction } from "@/actions/travel/flights/create-partial-offer-request-action";
import { createOfferRequestSchema } from "@/actions/travel/schema";
import { Counter } from "@/components/counter";
import LocationSelector from "@/components/location-selector";
import { TravelCalendar } from "@/components/travel-calendar";
import { logger } from "@/utils/logger";
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
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { SubmitButton } from "@travelese/ui/submit-button";
import { useToast } from "@travelese/ui/use-toast";
import { addDays, formatISO, startOfDay } from "date-fns";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SearchFlightsForm() {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const today = startOfDay(new Date());
  const defaultDepartureDate = formatISO(today, { representation: "date" });
  const defaultReturnDate = formatISO(addDays(today, 7), {
    representation: "date",
  });

  const form = useForm({
    resolver: zodResolver(createOfferRequestSchema),
    defaultValues: {
      slices: [
        { origin: "", destination: "", departure_date: defaultDepartureDate },
        { origin: "", destination: "", departure_date: defaultReturnDate },
      ],
      passengers: [{ type: DUFFEL_PASSENGER_TYPES.ADULT }],
      cabin_class: CABIN_CLASSES.ECONOMY,
      tripType: TRAVEL_TYPES.RETURN,
      bags: 0,
    },
  });

  const { execute: executeCreatePartialOfferRequest } = useAction(
    createPartialOfferRequestAction,
    {
      onSuccess: (result) => {
        toast({
          title: "Search successful",
          description: "Your travel options are ready to view.",
        });
        logger("Duffel API Response", result);
        setIsSearching(false);
      },
      onError: () => {
        toast({
          title: "Search failed",
          description:
            "There was an error processing your request. Please try again.",
          variant: "destructive",
        });
        setIsSearching(false);
      },
    },
  );

  const { execute: executeCreateOfferRequest } = useAction(
    createOfferRequestAction,
    {
      onSuccess: (result) => {
        toast({
          title: "Search successful",
          description: "Your travel options are ready to view.",
        });
        logger("Duffel API Response", result);
        setIsSearching(false);
      },
      onError: () => {
        toast({
          title: "Search failed",
          description:
            "There was an error processing your request. Please try again.",
          variant: "destructive",
        });
        setIsSearching(false);
      },
    },
  );

  const handleCreateOfferRequest = async (data: any) => {
    const { tripType, ...requestData } = data;
    setIsSearching(true);
    try {
      if (
        tripType === TRAVEL_TYPES.RETURN ||
        tripType === TRAVEL_TYPES.ONE_WAY
      ) {
        await executeCreateOfferRequest(requestData);
      } else if (tripType === TRAVEL_TYPES.MULTI_CITY) {
        await executeCreatePartialOfferRequest(requestData);
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description:
          "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleStopSearch = () => {
    setIsSearching(false);
    toast({
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

  const totalPassengers = form.watch("passengers").length;
  const tripType = form.watch("tripType");

  return (
    <div className="p-6 bg-background border-border shadow-sm items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCreateOfferRequest)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 mx-auto max-w-4xl">
            <FormField
              control={form.control}
              name="tripType"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          <Icons.Airports className="h-4 w-4 mr-2" />
                          <span className="flex-grow text-left">
                            {field.value.charAt(0).toUpperCase() +
                              field.value.slice(1).replace("_", " ")}
                          </span>
                          <Icons.ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      {["return", "one_way", "multi_city"].map((type) => (
                        <Button
                          key={type}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            field.onChange(type);
                            if (type === "one_way") {
                              form.setValue("slices", [
                                form.getValues("slices")[0],
                              ]);
                            } else if (type === "multi_city") {
                              form.setValue("slices", [
                                {
                                  origin: "",
                                  destination: "",
                                  departure_date: "",
                                },
                              ]);
                            }
                          }}
                        >
                          {type.charAt(0).toUpperCase() +
                            type.slice(1).replace("_", " ")}
                        </Button>
                      ))}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cabin_class"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          <Icons.Cabin className="h-4 w-4 mr-2" />
                          <span className="flex-grow text-left">
                            {field.value.charAt(0).toUpperCase() +
                              field.value.slice(1).replace("_", " ")}
                          </span>
                          <Icons.ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      {Object.values(CABIN_CLASSES).map((classType) => (
                        <Button
                          key={classType}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => field.onChange(classType)}
                        >
                          {classType.charAt(0).toUpperCase() +
                            classType.slice(1).replace("_", " ")}
                        </Button>
                      ))}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passengers"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <Icons.User className="h-4 w-4 mr-2" />
                          <span className="flex-grow text-left">
                            {totalPassengers}{" "}
                            {totalPassengers === 1 ? "Passenger" : "Passengers"}
                          </span>
                          <Icons.ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="grid gap-1">
                        {Object.values(DUFFEL_PASSENGER_TYPES).map((type) => (
                          <Counter
                            key={type}
                            label={
                              type.charAt(0).toUpperCase() +
                              type.slice(1).replace("_", " ")
                            }
                            subLabel=""
                            value={
                              field.value.filter((p: any) => p.type === type)
                                .length
                            }
                            onIncrement={() => {
                              field.onChange([...field.value, { type }]);
                            }}
                            onDecrement={() => {
                              const index = field.value.findIndex(
                                (p: any) => p.type === type,
                              );
                              if (index !== -1) {
                                const newPassengers = [...field.value];
                                newPassengers.splice(index, 1);
                                field.onChange(newPassengers);
                              }
                            }}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bags"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <Icons.Luggage className="h-4 w-4 mr-2" />
                          <span className="flex-grow text-left">
                            {field.value || 0}{" "}
                            {field.value === 1 ? "Bag" : "Bags"}
                          </span>
                          <Icons.ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <Counter
                        label="Cabin"
                        subLabel="baggage"
                        value={field.value || 0}
                        onIncrement={() =>
                          field.onChange((field.value || 0) + 1)
                        }
                        onDecrement={() =>
                          field.onChange(Math.max(0, (field.value || 0) - 1))
                        }
                      />
                      <Counter
                        label="Checked"
                        subLabel="baggage"
                        value={field.value || 0}
                        onIncrement={() =>
                          field.onChange((field.value || 0) + 1)
                        }
                        onDecrement={() =>
                          field.onChange(Math.max(0, (field.value || 0) - 1))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4 mx-auto max-w-4xl">
            {tripType === TRAVEL_TYPES.MULTI_CITY ? (
              form.watch("slices").map((slice, index) => (
                <div
                  key={index}
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
                          <TravelCalendar
                            defaultValue={{
                              from: field.value,
                              to: field.value,
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
                      onClick={isSearching ? handleStopSearch : undefined}
                      className="w-10 h-10"
                    >
                      {isSearching ? (
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
                        <LocationSelector
                          type="origin"
                          placeholder="Origin"
                          value={field.value}
                          onChange={(value, iataCode) =>
                            field.onChange(iataCode)
                          }
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
                        <LocationSelector
                          type="destination"
                          placeholder="Destination"
                          value={field.value}
                          onChange={(value, iataCode) =>
                            field.onChange(iataCode)
                          }
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
                      <TravelCalendar
                        defaultValue={{
                          from: field.value,
                          to:
                            form.getValues("slices.1.departure_date") ||
                            field.value,
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
    </div>
  );
}
