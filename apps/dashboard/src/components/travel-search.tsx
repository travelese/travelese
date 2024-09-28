"use client";

import { Button } from "@travelese/ui/button";
import { Checkbox } from "@travelese/ui/checkbox";
import { Input } from "@travelese/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarIcon,
  LuggageIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  UserIcon,
  ChevronDownIcon,
} from "lucide-react";
import { useState } from "react";
import { createPartialOfferRequestAction } from "../actions/travel/flights/create-partial-offer-request-action";
import { searchAccommodationAction } from "../actions/travel/stays/search-accommodation-action";
import LocationSelector from "./location-selector";
import Calendar from "./travel-calendar";

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
        className="h-4 w-4"
      >
        <MinusIcon className="h-4 w-4" />
      </Button>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="mx-4 w-6 text-center"
      >
        {value}
      </motion.span>
      <Button
        variant="outline"
        size="icon"
        onClick={onIncrement}
        className="h-4 w-4"
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export default function TravelSearch() {
  const [tripType, setTripType] = useState("return");
  const [travelClass, setTravelClass] = useState("economy");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState<
    "departure" | "return" | null
  >(null);
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [baggage, setBaggage] = useState({
    cabin: 0,
    checked: 0,
  });
  const [checkAccommodation, setCheckAccommodation] = useState(false);
  const [isTripTypeOpen, setIsTripTypeOpen] = useState(false);
  const [isTravelClassOpen, setIsTravelClassOpen] = useState(false);

  const updatePassengers = (
    type: keyof typeof passengers,
    increment: boolean,
  ) => {
    setPassengers((prev) => ({
      ...prev,
      [type]: increment ? prev[type] + 1 : Math.max(0, prev[type] - 1),
    }));
  };

  const updateBaggage = (type: keyof typeof baggage, increment: boolean) => {
    setBaggage((prev) => ({
      ...prev,
      [type]: increment ? prev[type] + 1 : Math.max(0, prev[type] - 1),
    }));
  };

  const totalPassengers =
    passengers.adults + passengers.children + passengers.infants;
  const totalBaggage = baggage.cabin + baggage.checked;

  const formatDate = (date: Date | null) => {
    return date
      ? date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";
  };

  const adjustDate = (date: Date | null, days: number) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    }
    return null;
  };

  const handleSearch = async () => {
    const searchData = {
      origin: from,
      destination: to,
      departure_date: departureDate?.toISOString().split("T")[0],
      return_date: returnDate?.toISOString().split("T")[0],
      passengers: [
        { type: "adult", count: passengers.adults },
        { type: "child", count: passengers.children },
        { type: "infant_without_seat", count: passengers.infants },
      ],
      cabin_class: travelClass,
    };

    try {
      if (tripType === "return" || tripType === "oneway") {
        const result = await createPartialOfferRequestAction({
          parsedInput: searchData,
        });
        if (result.success) {
          console.log("Partial offer request created:", result.data);
          // Handle successful search
        } else {
          console.error(
            "Failed to create partial offer request:",
            result.error,
          );
          // Handle error
        }
      } else if (tripType === "stay") {
        const result = await searchAccommodationAction(searchData);
        if (result.success) {
          console.log("Accommodation search results:", result.data);
          // Handle successful search
        } else {
          console.error("Failed to search accommodation:", result.error);
          // Handle error
        }
      }

      // Log the search event (you might want to move this to a server action as well)
      console.log("Search event:", {
        event: "SearchTravel",
        channel: "web",
        data: searchData,
      });
    } catch (error) {
      console.error("An error occurred during the search:", error);
      // Handle general error
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto p-6 bg-background rounded-lg shadow-lg border"
    >
      <motion.div layout className="flex flex-wrap gap-4 mb-4">
        <Popover open={isTripTypeOpen} onOpenChange={setIsTripTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isTripTypeOpen}
              className="w-[120px] justify-between"
            >
              {tripType === "return" ? "Return" : "One way"}
              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[160px] p-0">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setTripType("return");
                setIsTripTypeOpen(false);
              }}
            >
              Return
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setTripType("one_way");
                setIsTripTypeOpen(false);
              }}
            >
              One-way
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setTripType("multi_city");
                setIsTripTypeOpen(false);
              }}
            >
              Multi-city
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setTripType("nomad");
                setIsTripTypeOpen(false);
              }}
            >
              Nomad
            </Button>
          </PopoverContent>
        </Popover>

        <Popover open={isTravelClassOpen} onOpenChange={setIsTravelClassOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isTravelClassOpen}
              className="w-[120px] justify-between"
            >
              {travelClass.charAt(0).toUpperCase() + travelClass.slice(1)}
              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[160px] p-0">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setTravelClass("economy");
                setIsTravelClassOpen(false);
              }}
            >
              Economy
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setTravelClass("premium_economy");
                setIsTravelClassOpen(false);
              }}
            >
              Premium Economy
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setTravelClass("business");
                setIsTravelClassOpen(false);
              }}
            >
              Business
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setTravelClass("first");
                setIsTravelClassOpen(false);
              }}
            >
              First
            </Button>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[200px] justify-start text-left"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              <span>
                {totalPassengers} Passenger{totalPassengers !== 1 ? "s" : ""}
              </span>
              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="grid gap-1">
              <Counter
                label="Adults"
                subLabel="Over 11"
                value={passengers.adults}
                onIncrement={() => updatePassengers("adults", true)}
                onDecrement={() => updatePassengers("adults", false)}
              />
              <Counter
                label="Children"
                subLabel="2 – 11"
                value={passengers.children}
                onIncrement={() => updatePassengers("children", true)}
                onDecrement={() => updatePassengers("children", false)}
              />
              <Counter
                label="Infants"
                subLabel="Under 2"
                value={passengers.infants}
                onIncrement={() => updatePassengers("infants", true)}
                onDecrement={() => updatePassengers("infants", false)}
              />
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[150px] justify-start text-left"
            >
              <LuggageIcon className="mr-2 h-4 w-4" />
              <span>
                {totalBaggage} Bag{totalBaggage !== 1 ? "s" : ""}
              </span>
              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="grid gap-1">
              <Counter
                label="Cabin"
                subLabel="baggage"
                value={baggage.cabin}
                onIncrement={() => updateBaggage("cabin", true)}
                onDecrement={() => updateBaggage("cabin", false)}
              />
              <Counter
                label="Checked"
                subLabel="baggage"
                value={baggage.checked}
                onIncrement={() => updateBaggage("checked", true)}
                onDecrement={() => updateBaggage("checked", false)}
              />
            </div>
          </PopoverContent>
        </Popover>
      </motion.div>
      <motion.div layout className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <LocationSelector
          type="origin"
          label="From"
          value={from}
          onChange={setFrom}
        />
        <LocationSelector
          type="destination"
          label="To"
          value={to}
          onChange={setTo}
        />
        <Popover
          open={isCalendarOpen === "departure"}
          onOpenChange={(open) => setIsCalendarOpen(open ? "departure" : null)}
        >
          <PopoverTrigger asChild>
            <motion.div className="relative" layout>
              <Input
                placeholder="Departure"
                value={formatDate(departureDate)}
                readOnly
                className="pl-10 cursor-pointer"
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              onSelectDate={(date) => {
                setDepartureDate(date);
                setIsCalendarOpen(null);
              }}
              onClose={() => setIsCalendarOpen(null)}
              selectedDate={departureDate}
              onAdjustDate={(days) =>
                setDepartureDate(adjustDate(departureDate, days))
              }
            />
          </PopoverContent>
        </Popover>
        <AnimatePresence>
          {tripType === "return" && (
            <Popover
              open={isCalendarOpen === "return"}
              onOpenChange={(open) => setIsCalendarOpen(open ? "return" : null)}
            >
              <PopoverTrigger asChild>
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    placeholder="Return"
                    value={formatDate(returnDate)}
                    readOnly
                    className="pl-10 cursor-pointer"
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  onSelectDate={(date) => {
                    setReturnDate(date);
                    setIsCalendarOpen(null);
                  }}
                  onClose={() => setIsCalendarOpen(null)}
                  selectedDate={returnDate}
                  onAdjustDate={(days) =>
                    setReturnDate(adjustDate(returnDate, days))
                  }
                />
              </PopoverContent>
            </Popover>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div layout className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="accommodation"
            checked={checkAccommodation}
            onCheckedChange={(checked) =>
              setCheckAccommodation(checked as boolean)
            }
          />
          <label htmlFor="accommodation">
            Check accommodation with{" "}
            <span className="font-semibold">Priceline</span>
          </label>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={handleSearch}>
            <SearchIcon className="mr-2 h-4 w-4" />
            Explore
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
