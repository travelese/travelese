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
import { useToast } from "@travelese/ui/use-toast";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface CounterProps {
  label: string;
  subLabel: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const Counter: React.FC<CounterProps> = ({
  label,
  subLabel,
  value,
  onIncrement,
  onDecrement,
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex flex-col">
      <span className="text-sm">{label}</span>
      <span className="text-xs text-muted-foreground">{subLabel}</span>
    </div>
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        onClick={onDecrement}
        disabled={value === 0}
        className="h-8 w-8"
      >
        <Icons.Minus className="h-4 w-4" />
      </Button>
      <span className="mx-4 w-6 text-center">{value}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={onIncrement}
        className="h-8 w-8"
      >
        <Icons.Plus className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export default function CreateOfferForm() {
  const { toast } = useToast();
  const [flightLegs, setFlightLegs] = useState<CreateOfferRequestSlice[]>([
    { origin: "", destination: "", departure_date: "" },
  ]);
  const [isSearching, setIsSearching] = useState(false);

  const today = startOfDay(new Date());
  const defaultDepartureDate = format(today, "yyyy-MM-dd");
  const defaultReturnDate = format(addDays(today, 4), "yyyy-MM-dd");

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
    // Implement logic to cancel ongoing API requests if possible
    toast({
      title: "Search stopped",
      description: "The search has been cancelled.",
    });
  };

  const addFlightLeg = () => {
    setFlightLegs([
      ...flightLegs,
      { origin: "", destination: "", departure_date: "" },
    ]);
    form.setValue("parsedInput.slices", [
      ...form.getValues("parsedInput.slices"),
      { origin: "", destination: "", departure_date: "" },
    ]);
  };

  const removeFlightLeg = (index: number) => {
    if (flightLegs.length > 1) {
      const newFlightLegs = flightLegs.filter((_, i) => i !== index);
      setFlightLegs(newFlightLegs);
      form.setValue("parsedInput.slices", newFlightLegs);
    }
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, today);
  };

  const totalPassengers = form.watch("parsedInput.passengers").length;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleCreateOfferRequest)}
        className="w-full max-w-4xl mx-auto m-2 p-6 border"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
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
                    {["return", "one_way", "multi_city", "nomad"].map(
                      (type) => (
                        <Button
                          key={type}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => field.onChange(type)}
                        >
                          {type.charAt(0).toUpperCase() +
                            type.slice(1).replace("_", " ")}
                        </Button>
                      ),
                    )}
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parsedInput.cabin_class"
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
            name="parsedInput.passengers"
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
            name="parsedInput.bags"
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
                      onIncrement={() => field.onChange((field.value || 0) + 1)}
                      onDecrement={() =>
                        field.onChange(Math.max(0, (field.value || 0) - 1))
                      }
                    />
                    <Counter
                      label="Checked"
                      subLabel="baggage"
                      value={field.value || 0}
                      onIncrement={() => field.onChange((field.value || 0) + 1)}
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {form.watch("tripType") === "multi_city" ? (
            flightLegs.map((leg, index) => (
              <div
                key={index}
                className="col-span-full grid grid-cols-1  md:grid-cols-4 gap-4"
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
                            const newLegs = [...flightLegs];
                            newLegs[index].origin = iataCode;
                            setFlightLegs(newLegs);
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
                            const newLegs = [...flightLegs];
                            newLegs[index].destination = iataCode;
                            setFlightLegs(newLegs);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`parsedInput.slices.${index}.departure_date`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-between pl-3 pr-2"
                            >
                              <Icons.Calendar className="h-4 w-4 mr-2" />
                              <Icons.ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {index > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeFlightLeg(index)}
                    className="w-10 h-10"
                  >
                    <Icons.X className="h-4 w-4" />
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
                        onChange={(value, iataCode) => field.onChange(iataCode)}
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
                        onChange={(value, iataCode) => field.onChange(iataCode)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="parsedInput.slices"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-between pl-3 pr-2"
                            >
                              <Icons.Calendar className="h-4 w-4 mr-2" />
                              <Icons.ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("tripType") === "multi_city" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFlightLeg}
                    className="flex items-center"
                  >
                    <Icons.Plus className="mr-2 h-4 w-4" />
                    Add Flight
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end mt-4">
          <Button
            type="submit"
            disabled={isSearching}
            onClick={isSearching ? handleStopSearch : undefined}
          >
            {isSearching ? (
              <>
                <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Stop
              </>
            ) : (
              <>
                <Icons.Explore className="mr-2 h-4 w-4" />
                Search Flights
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
