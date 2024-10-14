"use client";

import {
  CABIN_CLASSES,
  DUFFEL_PASSENGER_TYPES,
} from "@/actions/travel/constants";
import { createBatchOfferRequestAction } from "@/actions/travel/flights/create-batch-offer-request-action";
import { createOfferRequestAction } from "@/actions/travel/flights/create-offer-request-action";
import { createPartialOfferRequestAction } from "@/actions/travel/flights/create-partial-offer-request-action";
import { createOfferRequestSchema } from "@/actions/travel/schema";
import LocationSelector from "@/components/location-selector";
import Calendar from "@/components/travel-calendar";
import { logger } from "@/utils/logger";
import type { CreateOfferRequestSlice } from "@duffel/api/types";
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
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function CreateOfferForm() {
  const { toast } = useToast();
  const [flightSegments, setFlightSegments] = useState<
    CreateOfferRequestSlice[]
  >([{ origin: "", destination: "", departure_date: "" }]);
  const [isSearching, setIsSearching] = useState(false);

  const today = startOfDay(new Date());
  const defaultDepartureDate = format(today, "yyyy-MM-dd");
  const defaultReturnDate = format(addDays(today, 7), "yyyy-MM-dd");

  const form = useForm({
    resolver: zodResolver(createOfferRequestSchema),
    defaultValues: {
      parsedInput: {
        slices: [
          { origin: "", destination: "", departure_date: defaultDepartureDate },
          { origin: "", destination: "", departure_date: defaultReturnDate },
        ],
        passengers: [{ type: DUFFEL_PASSENGER_TYPES.ADULT }],
        cabin_class: CABIN_CLASSES.ECONOMY,
        private_fares: {},
      },
      tripType: "return",
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

  const { execute: executeCreateBatchOfferRequest } = useAction(
    createBatchOfferRequestAction,
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
    const { parsedInput, tripType } = data;
    setIsSearching(true);
    try {
      if (tripType === "return" || tripType === "one_way") {
        await executeCreateOfferRequest({ parsedInput });
      } else if (tripType === "multi_city") {
        await executeCreatePartialOfferRequest({ parsedInput });
      } else if (tripType === "nomad") {
        await executeCreateBatchOfferRequest({ parsedInput });
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
    setFlightSegments([
      ...flightSegments,
      { origin: "", destination: "", departure_date: "" },
    ]);
    form.setValue("parsedInput.slices", [
      ...form.getValues("parsedInput.slices"),
      { origin: "", destination: "", departure_date: "" },
    ]);
  };

  const removeFlightSegment = (index: number) => {
    if (flightSegments.length > 1) {
      const newFlightSegments = flightSegments.filter((_, i) => i !== index);
      setFlightSegments(newFlightSegments);
      form.setValue("parsedInput.slices", newFlightSegments);
    }
  };

  const handleDateSelect = (index: number) => (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    form.setValue(`parsedInput.slices.${index}.departure_date`, formattedDate);
  };

  const handleDateAdjust = (index: number) => (days: number) => {
    const currentDate = form.getValues(
      `parsedInput.slices.${index}.departure_date`,
    );
    const newDate = addDays(new Date(currentDate), days);
    const formattedDate = format(newDate, "yyyy-MM-dd");
    form.setValue(`parsedInput.slices.${index}.departure_date`, formattedDate);
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, today);
  };

  const totalPassengers = form.watch("parsedInput.passengers").length;
  const tripType = form.watch("tripType");

  return (
    <div className="p-3 bg-background shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCreateOfferRequest)}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {tripType === "multi_city" || tripType === "nomad" ? (
              flightSegments.map((segment, index) => (
                <div
                  key={index}
                  className="col-span-full grid grid-cols-1 md:grid-cols-5 gap-4"
                >
                  <FormField
                    control={form.control}
                    name={`parsedInput.slices.${index}.origin`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <LocationSelector
                            type="origin"
                            placeholder="Origin"
                            value={field.value}
                            onChange={(value, iataCode) => {
                              field.onChange(iataCode);
                              const newSegments = [...flightSegments];
                              newSegments[index].origin = iataCode;
                              setFlightSegments(newSegments);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`parsedInput.slices.${index}.destination`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <LocationSelector
                            type="destination"
                            placeholder="Destination"
                            value={field.value}
                            onChange={(value, iataCode) => {
                              field.onChange(iataCode);
                              const newSegments = [...flightSegments];
                              newSegments[index].destination = iataCode;
                              setFlightSegments(newSegments);
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
                        index === flightSegments.length - 1
                          ? addFlightSegment()
                          : removeFlightSegment(index)
                      }
                      className="w-10 h-10"
                    >
                      {index === flightSegments.length - 1 ? (
                        <Icons.Plus className="h-4 w-4" />
                      ) : (
                        <Icons.Close className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {index === flightSegments.length - 1 && (
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
                  name="parsedInput.slices.0.origin"
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
                  name="parsedInput.slices.0.destination"
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
                <SubmitButton
                  type="submit"
                  disabled={isSearching}
                  isSubmitting={isSearching}
                >
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
