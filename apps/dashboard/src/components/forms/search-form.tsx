"use client";

import { Badge } from "@travelese/ui/badge";
import { Button } from "@travelese/ui/button";
import { Calendar } from "@travelese/ui/calendar";
import { Input } from "@travelese/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { format } from "date-fns";
import { ArrowUpIcon, CalendarIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const cities = [
  "New York",
  "London",
  "Tokyo",
  "Paris",
  "Sydney",
  "Dubai",
  "Rome",
  "Bangkok",
  "Singapore",
  "Hong Kong",
  "Los Angeles",
  "Berlin",
  "Madrid",
  "Toronto",
  "Seoul",
];

const cabinClasses = ["Economy", "Premium Economy", "Business", "First"];

export default function SearchForm() {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedFrom, setSelectedFrom] = useState("");
  const [selectedTo, setSelectedTo] = useState("");
  const [dateRange, setDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);
  const [passengers, setPassengers] = useState("");
  const [cabin, setCabin] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [stage, setStage] = useState<
    "from" | "to" | "dates" | "passengers" | "cabin" | "complete"
  >("from");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.length > 0) {
      let filtered: string[] = [];
      if (stage === "from" || stage === "to") {
        filtered = cities
          .filter((city) => city.toLowerCase().includes(input.toLowerCase()))
          .slice(0, 5);
      } else if (stage === "passengers") {
        filtered = ["1", "2", "3", "4", "5", "6", "7", "8"].filter((num) =>
          num.includes(input),
        );
      } else if (stage === "cabin") {
        filtered = cabinClasses.filter((cls) =>
          cls.toLowerCase().includes(input.toLowerCase()),
        );
      }
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [input, stage]);

  const handleSelection = (selection: string) => {
    if (stage === "from") {
      setSelectedFrom(selection);
      setStage("to");
    } else if (stage === "to") {
      setSelectedTo(selection);
      setStage("dates");
    } else if (stage === "passengers") {
      setPassengers(selection);
      setStage("cabin");
    } else if (stage === "cabin") {
      setCabin(selection);
      setStage("complete");
    }
    setInput("");
    inputRef.current?.focus();
  };

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (dates && dates.length > 0) {
      setDateRange([dates[0], dates[1]]);
      if (dates[0] && dates[1]) {
        setCalendarOpen(false);
        setStage("passengers");
      } else {
        setCalendarOpen(true);
      }
    } else {
      setDateRange([undefined, undefined]);
    }
  };

  const handleRemove = (
    item: "from" | "to" | "dates" | "passengers" | "cabin",
  ) => {
    switch (item) {
      case "from":
        setSelectedFrom("");
        setStage("from");
        break;
      case "to":
        setSelectedTo("");
        setStage("to");
        break;
      case "dates":
        setDateRange([undefined, undefined]);
        setStage("dates");
        break;
      case "passengers":
        setPassengers("");
        setStage("passengers");
        break;
      case "cabin":
        setCabin("");
        setStage("cabin");
        break;
    }
  };

  const formatDateRange = () => {
    if (dateRange[0] && dateRange[1]) {
      return `${format(dateRange[0], "dd MMM")} - ${format(dateRange[1], "dd MMM")}`;
    }
    return "";
  };

  const renderInput = () => {
    let placeholder = "Search for flights...";
    if (stage === "from") placeholder = "Flying from...";
    else if (stage === "to") placeholder = "Flying to...";
    else if (stage === "dates") placeholder = "Select dates...";
    else if (stage === "passengers") placeholder = "Number of passengers...";
    else if (stage === "cabin") placeholder = "Select cabin class...";

    return (
      <div className="flex items-center space-x-2 p-2">
        {selectedFrom && (
          <Badge variant="secondary" className="flex items-center">
            {selectedFrom}
            <XIcon
              className="ml-1 h-3 w-3 cursor-pointer"
              onClick={() => handleRemove("from")}
            />
          </Badge>
        )}
        {selectedTo && (
          <>
            <ArrowUpIcon className="rotate-90" />
            <Badge variant="secondary" className="flex items-center">
              {selectedTo}
              <XIcon
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleRemove("to")}
              />
            </Badge>
          </>
        )}
        {dateRange[0] && dateRange[1] && (
          <Badge variant="secondary" className="flex items-center">
            {formatDateRange()}
            <XIcon
              className="ml-1 h-3 w-3 cursor-pointer"
              onClick={() => handleRemove("dates")}
            />
          </Badge>
        )}
        {passengers && (
          <Badge variant="secondary" className="flex items-center">
            {passengers}{" "}
            {Number.parseInt(passengers) === 1 ? "passenger" : "passengers"}
            <XIcon
              className="ml-1 h-3 w-3 cursor-pointer"
              onClick={() => handleRemove("passengers")}
            />
          </Badge>
        )}
        {cabin && (
          <Badge variant="secondary" className="flex items-center">
            {cabin}
            <XIcon
              className="ml-1 h-3 w-3 cursor-pointer"
              onClick={() => handleRemove("cabin")}
            />
          </Badge>
        )}
        <Input
          ref={inputRef}
          className="flex-grow border-none focus:outline-none focus:ring-0"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="bg-background border items-center justify-center mx-40">
      <div className="relative">
        {renderInput()}
        <Button
          variant="ghost"
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          onClick={() => inputRef.current?.focus()}
        >
          <ArrowUpIcon />
        </Button>
        {suggestions.length > 0 && (
          <div className="absolute w-full border rounded-b-md mt-1 overflow-hidden z-10">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelection(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
        {stage === "dates" && (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full mt-2">
                {dateRange[0] ? format(dateRange[0], "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange[0]}
                selected={{ from: dateRange[0], to: dateRange[1] }}
                onSelect={(range) => handleDateSelect([range?.from, range?.to])}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}
        {stage === "complete" && (
          <Button
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={handleSearch}
          >
            Search Flights
          </Button>
        )}
      </div>
    </div>
  );
}
