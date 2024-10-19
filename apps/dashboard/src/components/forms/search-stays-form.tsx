"use client";

import { searchAccommodationSchema } from "@/actions/travel/schema";
import { searchAccommodationAction } from "@/actions/travel/stays/search-accommodation-action";
import { TravelLocation } from "@/components/travel/travel-location";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@travelese/ui/button";
import { Calendar } from "@travelese/ui/calendar";
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
import { addDays, format, isBefore, startOfTomorrow } from "date-fns";
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

export default function SearchStaysForm() {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const tomorrow = startOfTomorrow();
  const defaultCheckIn = format(tomorrow, "yyyy-MM-dd");
  const defaultCheckOut = format(addDays(tomorrow, 4), "yyyy-MM-dd");

  const form = useForm({
    resolver: zodResolver(searchAccommodationSchema),
    defaultValues: {
      destination: "",
      checkIn: defaultCheckIn,
      checkOut: defaultCheckOut,
      guests: 1,
      rooms: 1,
    },
  });

  const { execute: executeSearchAccommodation } = useAction(
    searchAccommodationAction,
    {
      onSuccess: (result) => {
        toast({
          title: "Search successful",
          description: "Your accommodation options are ready to view.",
        });
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

  const handleSearchAccommodation = async (data: any) => {
    setIsSearching(true);
    try {
      await executeSearchAccommodation(data);
      toast({
        title: "Search initiated",
        description: "Searching for accommodation options.",
      });
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

  const isDateDisabled = (date: Date) => {
    return isBefore(date, tomorrow);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSearchAccommodation)}
        className="w-full max-w-4xl mx-auto m-2 p-6 border"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem className="col-span-full md:col-span-2">
                <FormControl>
                  <TravelLocation
                    type="stays"
                    placeholder="Destination"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-between pl-3 pr-2"
                      >
                        <Icons.Calendar className="h-4 w-4 mr-2" />
                        <span className="flex-grow text-left">
                          {field.value || "Check-in"}
                        </span>
                        <Icons.ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      disabled={isDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-between pl-3 pr-2"
                      >
                        <Icons.Calendar className="h-4 w-4 mr-2" />
                        <span className="flex-grow text-left">
                          {field.value || "Check-out"}
                        </span>
                        <Icons.ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      disabled={(date) =>
                        isDateDisabled(date) ||
                        isBefore(date, new Date(form.getValues("checkIn")))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField
            control={form.control}
            name="guests"
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
                          {field.value} {field.value === 1 ? "Guest" : "Guests"}
                        </span>
                        <Icons.ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-60">
                    <Counter
                      label="Guests"
                      subLabel=""
                      value={field.value}
                      onIncrement={() => field.onChange(field.value + 1)}
                      onDecrement={() =>
                        field.onChange(Math.max(1, field.value - 1))
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rooms"
            render={({ field }) => (
              <FormItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <Icons.Bed className="h-4 w-4 mr-2" />
                        <span className="flex-grow text-left">
                          {field.value} {field.value === 1 ? "Room" : "Rooms"}
                        </span>
                        <Icons.ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-60">
                    <Counter
                      label="Rooms"
                      subLabel=""
                      value={field.value}
                      onIncrement={() => field.onChange(field.value + 1)}
                      onDecrement={() =>
                        field.onChange(Math.max(1, field.value - 1))
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end mt-4">
          <Button
            type="submit"
            disabled={isSearching}
            onClick={isSearching ? handleStopSearch : undefined}
          >
            {isSearching ? (
              <>
                <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />
                Stop
              </>
            ) : (
              <>
                <Icons.Search className="mr-2 h-4 w-4" />
                Search Accommodation
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
