"use client";

import { DuffelError } from "@duffel/api";
import { Button } from "@travelese/ui/button";
import { Checkbox } from "@travelese/ui/checkbox";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@travelese/ui/sheet";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarIcon,
  ChevronDownIcon,
  LuggageIcon,
  MinusIcon,
  PlusIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPartialOfferRequestAction } from "../actions/travel/flights/create-partial-offer-request-action";
import { searchAccommodationAction } from "../actions/travel/stays/search-accommodation-action";
import { logger } from "../utils/logger";
import LocationSelector from "./location-selector";
import Calendar from "./travel-calendar";

const PASSENGER_TYPES = {
  ADULT: "adult",
  CHILD: "child",
  INFANT_WITHOUT_SEAT: "infant_without_seat",
} as const;

const CABIN_CLASSES = {
  ECONOMY: "economy",
  PREMIUM_ECONOMY: "premium_economy",
  BUSINESS: "business",
  FIRST: "first",
} as const;

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
  const [fromIATA, setFromIATA] = useState("");
  const [to, setTo] = useState("");
  const [toIATA, setToIATA] = useState("");
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const PopoverOrSheet = isMobile ? Sheet : Popover;
  const TriggerComponent = isMobile ? SheetTrigger : PopoverTrigger;
  const ContentComponent = isMobile ? SheetContent : PopoverContent;

  const renderTriggerContent = (icon: React.ReactNode, text: string) => (
    <>
      {icon}
      <span className={`flex-grow text-left ${isMobile ? "hidden" : ""}`}>
        {text}
      </span>
      <ChevronDownIcon className={`h-4 w-4 ml-2 ${isMobile ? "hidden" : ""}`} />
    </>
  );

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

  const handleFromChange = (value: string, iataCode: string) => {
    setFrom(value);
    setFromIATA(iataCode);
  };

  const handleToChange = (value: string, iataCode: string) => {
    setTo(value);
    setToIATA(iataCode);
  };

  const handleSearch = async () => {
    const formatDateForDuffel = (date: Date | null) => {
      return date ? format(date, "yyyy-MM-dd") : "";
    };

    const searchData = {
      slices: [
        {
          origin: fromIATA,
          destination: toIATA,
          departure_date: formatDateForDuffel(departureDate),
        },
      ],
      passengers: [
        ...Array(passengers.adults).fill({
          type: PASSENGER_TYPES.ADULT,
          fare_type: "adult",
        }),
        ...Array(passengers.children).fill({
          type: PASSENGER_TYPES.CHILD,
          fare_type: "child",
        }),
        ...Array(passengers.infants).fill({
          type: PASSENGER_TYPES.INFANT_WITHOUT_SEAT,
          fare_type: "infant",
        }),
      ],
      cabin_class: travelClass.toLowerCase() as keyof typeof CABIN_CLASSES,
      private_fares: {},
    };

    if (tripType === "return" && returnDate) {
      searchData.slices.push({
        origin: toIATA,
        destination: fromIATA,
        departure_date: formatDateForDuffel(returnDate),
      });
    }

    try {
      if (tripType === "return" || tripType === "one_way") {
        await createPartialOfferRequestAction(searchData);
      }
    } catch (error) {
      // Handle error silently or show a user-friendly message
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto p-6 bg-background rounded-lg shadow-lg border"
    >
      <motion.div layout className="grid grid-cols-4 gap-2 mb-4">
        <PopoverOrSheet>
          <TriggerComponent asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isTripTypeOpen}
              className="w-full justify-between"
            >
              {renderTriggerContent(
                <Icons.Airports className="h-4 w-4 mr-2" />,
                tripType === "return" ? "Return" : "One way",
              )}
            </Button>
          </TriggerComponent>
          <ContentComponent
            side={isMobile ? "bottom" : undefined}
            className={isMobile ? "h-[50vh]" : "w-[160px] p-0"}
          >
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
          </ContentComponent>
        </PopoverOrSheet>

        <PopoverOrSheet>
          <TriggerComponent asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isTravelClassOpen}
              className="w-full justify-between"
            >
              {renderTriggerContent(
                <Icons.Cabin className="h-4 w-4 mr-2" />,
                travelClass.charAt(0).toUpperCase() + travelClass.slice(1),
              )}
            </Button>
          </TriggerComponent>
          <ContentComponent
            side={isMobile ? "bottom" : undefined}
            className={isMobile ? "h-[50vh]" : "w-[160px] p-0"}
          >
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
          </ContentComponent>
        </PopoverOrSheet>

        <PopoverOrSheet>
          <TriggerComponent asChild>
            <Button variant="outline" className="w-full justify-between">
              {renderTriggerContent(
                <UserIcon className="h-4 w-4 mr-2" />,
                `${totalPassengers} Passenger${totalPassengers !== 1 ? "s" : ""}`,
              )}
            </Button>
          </TriggerComponent>
          <ContentComponent
            side={isMobile ? "bottom" : undefined}
            className={isMobile ? "h-[50vh]" : "w-60"}
          >
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
          </ContentComponent>
        </PopoverOrSheet>

        <PopoverOrSheet>
          <TriggerComponent asChild>
            <Button variant="outline" className="w-full justify-between">
              {renderTriggerContent(
                <LuggageIcon className="h-4 w-4 mr-2" />,
                `${totalBaggage} Bag${totalBaggage !== 1 ? "s" : ""}`,
              )}
            </Button>
          </TriggerComponent>
          <ContentComponent
            side={isMobile ? "bottom" : undefined}
            className={isMobile ? "h-[50vh]" : "w-60"}
          >
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
          </ContentComponent>
        </PopoverOrSheet>
      </motion.div>

      {isMobile ? (
        <motion.div layout className="grid grid-cols-2 gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between pl-3 pr-2"
              >
                <Icons.FlightsDeparture className="h-4 w-4 mr-2" />
                <span className="flex-grow text-left">{from || "Origin"}</span>
                <ChevronDownIcon className="h-4 w-4 ml-2" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <LocationSelector
                type="origin"
                placeholder="Origin"
                value={from}
                onChange={handleFromChange}
              />
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between pl-3 pr-2"
              >
                <Icons.FlightsArrival className="h-4 w-4 mr-2" />
                <span className="flex-grow text-left">
                  {to || "Destination"}
                </span>
                <ChevronDownIcon className="h-4 w-4 ml-2" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <LocationSelector
                type="destination"
                placeholder="Destination"
                value={to}
                onChange={handleToChange}
              />
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between pl-3 pr-2"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span className="flex-grow text-left">
                  {formatDate(departureDate) || "Departure"}
                </span>
                <ChevronDownIcon className="h-4 w-4 ml-2" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
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
            </SheetContent>
          </Sheet>

          {tripType === "return" && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between pl-3 pr-2"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span className="flex-grow text-left">
                    {formatDate(returnDate) || "Return"}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 ml-2" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
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
              </SheetContent>
            </Sheet>
          )}
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LocationSelector
            type="origin"
            placeholder="Origin"
            value={from}
            onChange={handleFromChange}
          />
          <LocationSelector
            type="destination"
            placeholder="Destination"
            value={to}
            onChange={handleToChange}
          />
          <Popover
            open={isCalendarOpen === "departure"}
            onOpenChange={(open) =>
              setIsCalendarOpen(open ? "departure" : null)
            }
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between pl-3 pr-2"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span className="flex-grow text-left">
                  {formatDate(departureDate) || "Departure"}
                </span>
                <ChevronDownIcon className="h-4 w-4 ml-2" />
              </Button>
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
                onOpenChange={(open) =>
                  setIsCalendarOpen(open ? "return" : null)
                }
              >
                <PopoverTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-between pl-3 pr-2"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span className="flex-grow text-left">
                        {formatDate(returnDate) || "Return"}
                      </span>
                      <ChevronDownIcon className="h-4 w-4 ml-2" />
                    </Button>
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
      )}
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
            <Icons.Explore className="mr-2 h-4 w-4" />
            Explore
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
