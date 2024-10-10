"use client";

import { useTravelSearchStore } from "@/store/travel";
import type {
  CreateOfferRequest,
  CreateOfferRequestSlice,
} from "@duffel/api/types";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@travelese/ui/sheet";
import { useToast } from "@travelese/ui/use-toast";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import {
  type CABIN_CLASSES,
  DUFFEL_PASSENGER_TYPES,
} from "../actions/travel/constants";
import { createBatchOfferRequestAction } from "../actions/travel/flights/create-batch-offer-request-action";
import { createOfferRequestAction } from "../actions/travel/flights/create-offer-request-action";
import { createPartialOfferRequestAction } from "../actions/travel/flights/create-partial-offer-request-action";
import { logger } from "../utils/logger";
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
        <Icons.Minus className="h-4 w-4" />
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
        <Icons.Plus className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export default function TravelSearch() {
  const { toast } = useToast();
  const {
    tripType,
    setTripType,
    travelClass,
    setTravelClass,
    from,
    setFrom,
    fromIATA,
    setFromIATA,
    to,
    setTo,
    toIATA,
    setToIATA,
    departureDate,
    setDepartureDate,
    returnDate,
    setReturnDate,
    passengers,
    updatePassengers,
    baggage,
    updateBaggage,
    checkAccommodation,
    setCheckAccommodation,
  } = useTravelSearchStore();

  const [isCalendarOpen, setIsCalendarOpen] = useState<
    "departure" | "return" | null
  >(null);
  const [isTripTypeOpen, setIsTripTypeOpen] = useState(false);
  const [isTravelClassOpen, setIsTravelClassOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [flightLegs, setFlightLegs] = useState<CreateOfferRequestSlice[]>([
    {
      origin: fromIATA,
      destination: toIATA,
      departure_date: departureDate ? format(departureDate, "yyyy-MM-dd") : "",
    },
  ]);

  const [stayDestination, setStayDestination] = useState("");
  const [stayDates, setStayDates] = useState({ checkIn: null, checkOut: null });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    execute: executeCreatePartialOfferRequest,
    status: partialOfferStatus,
  } = useAction(createPartialOfferRequestAction, {
    onExecute: () => {
      // Add any pre-execution logic here
    },
    onSuccess: (result) => {
      toast({
        title: "Search successful",
        description: "Your travel options are ready to view.",
      });
      logger("Duffel API Response", result);
    },
    onError: (error) => {
      toast({
        title: "Search failed",
        description:
          "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { execute: executeCreateOfferRequest, status: offerStatus } = useAction(
    createOfferRequestAction,
    {
      onExecute: () => {
        // Add any pre-execution logic here
      },
      onSuccess: (result) => {
        toast({
          title: "Search successful",
          description: "Your travel options are ready to view.",
        });
        logger("Duffel API Response", result);
      },
      onError: (error) => {
        toast({
          title: "Search failed",
          description:
            "There was an error processing your request. Please try again.",
          variant: "destructive",
        });
      },
    },
  );

  const { execute: executeCreateBatchOfferRequest, status: batchOfferStatus } =
    useAction(createBatchOfferRequestAction, {
      onExecute: () => {
        // Add any pre-execution logic here
      },
      onSuccess: (result) => {
        toast({
          title: "Search successful",
          description: "Your travel options are ready to view.",
        });
        logger("Duffel API Response", result);
      },
      onError: (error) => {
        toast({
          title: "Search failed",
          description:
            "There was an error processing your request. Please try again.",
          variant: "destructive",
        });
      },
    });

  const PopoverOrSheet = isMobile ? Sheet : Popover;
  const TriggerComponent = isMobile ? SheetTrigger : PopoverTrigger;
  const ContentComponent = isMobile ? SheetContent : PopoverContent;

  const renderTriggerContent = (icon: React.ReactNode, text: string) => (
    <>
      {icon}
      <span className={`flex-grow text-left ${isMobile ? "hidden" : ""}`}>
        {text}
      </span>
      <Icons.ChevronDown
        className={`h-4 w-4 ml-2 ${isMobile ? "hidden" : ""}`}
      />
    </>
  );

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

  const handleCreateOfferRequest = async () => {
    const formatDateForDuffel = (date: Date | null) => {
      return date ? format(date, "yyyy-MM-dd") : "";
    };

    const baseSearchData: CreateOfferRequest = {
      slices:
        tripType === "multi_city"
          ? flightLegs
          : [
              {
                origin: fromIATA,
                destination: toIATA,
                departure_date: formatDateForDuffel(departureDate),
              },
            ],
      passengers: [
        { type: DUFFEL_PASSENGER_TYPES.ADULT },
        ...Array(passengers.adults - 1).fill({
          type: DUFFEL_PASSENGER_TYPES.ADULT,
        }),
        ...Array(passengers.children).fill({
          type: DUFFEL_PASSENGER_TYPES.CHILD,
        }),
        ...Array(passengers.infants).fill({
          type: DUFFEL_PASSENGER_TYPES.INFANT_WITHOUT_SEAT,
        }),
      ],
      cabin_class: travelClass as keyof typeof CABIN_CLASSES,
      private_fares: {},
    };

    if (tripType === "return" && returnDate) {
      baseSearchData.slices.push({
        origin: toIATA,
        destination: fromIATA,
        departure_date: formatDateForDuffel(returnDate),
      });
    }

    if (tripType === "return" || tripType === "one_way") {
      await executeCreateOfferRequest({ parsedInput: baseSearchData });
    } else if (tripType === "multi_city") {
      await executeCreatePartialOfferRequest({ parsedInput: baseSearchData });
    } else if (tripType === "nomad") {
      await executeCreateBatchOfferRequest({ parsedInput: baseSearchData });
    }
  };

  const addFlightLeg = () => {
    setFlightLegs([
      ...flightLegs,
      { origin: "", destination: "", departure_date: "" },
    ]);
  };

  const removeFlightLeg = (index: number) => {
    if (flightLegs.length > 1) {
      setFlightLegs(flightLegs.filter((_, i) => i !== index));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto m-2 p-6 border"
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
                <Icons.User className="h-4 w-4 mr-2" />,
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
                <Icons.Luggage className="h-4 w-4 mr-2" />,
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
                <Icons.ChevronDown className="h-4 w-4 ml-2" />
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
                <Icons.ChevronDown className="h-4 w-4 ml-2" />
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
                <Icons.Calendar className="h-4 w-4 mr-2" />
                <span className="flex-grow text-left">
                  {formatDate(departureDate) || "Departure"}
                </span>
                <Icons.ChevronDown className="h-4 w-4 ml-2" />
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
                  <Icons.Calendar className="h-4 w-4 mr-2" />
                  <span className="flex-grow text-left">
                    {formatDate(returnDate) || "Return"}
                  </span>
                  <Icons.ChevronDown className="h-4 w-4 ml-2" />
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
          {tripType === "multi_city" ? (
            flightLegs.map((leg, index) => (
              <div
                key={index}
                className="col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <LocationSelector
                  type="origin"
                  placeholder="Origin"
                  value={leg.origin}
                  onChange={(value, iataCode) => {
                    const newLegs = [...flightLegs];
                    newLegs[index].origin = iataCode;
                    setFlightLegs(newLegs);
                  }}
                />
                <LocationSelector
                  type="destination"
                  placeholder="Destination"
                  value={leg.destination}
                  onChange={(value, iataCode) => {
                    const newLegs = [...flightLegs];
                    newLegs[index].destination = iataCode;
                    setFlightLegs(newLegs);
                  }}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between pl-3 pr-2"
                    >
                      <Icons.Calendar className="h-4 w-4 mr-2" />
                      <span className="flex-grow text-left">
                        {leg.departure_date || "Departure"}
                      </span>
                      <Icons.ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      onSelectDate={(date) => {
                        const newLegs = [...flightLegs];
                        newLegs[index].departure_date = format(
                          date,
                          "yyyy-MM-dd",
                        );
                        setFlightLegs(newLegs);
                      }}
                      onClose={() => {}}
                      selectedDate={
                        leg.departure_date ? new Date(leg.departure_date) : null
                      }
                      onAdjustDate={() => {}}
                    />
                  </PopoverContent>
                </Popover>
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
                    <Icons.Calendar className="h-4 w-4 mr-2" />
                    <span className="flex-grow text-left">
                      {formatDate(departureDate) || "Departure"}
                    </span>
                    <Icons.ChevronDown className="h-4 w-4 ml-2" />
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
                          <Icons.Calendar className="h-4 w-4 mr-2" />
                          <span className="flex-grow text-left">
                            {formatDate(returnDate) || "Return"}
                          </span>
                          <Icons.ChevronDown className="h-4 w-4 ml-2" />
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
            </>
          )}
        </motion.div>
      )}

      {checkAccommodation && (
        <motion.div
          layout
          className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <LocationSelector
            type="stays"
            placeholder="Destination"
            value={stayDestination}
            onChange={(value) => setStayDestination(value)}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between pl-3 pr-2"
              >
                <Icons.Calendar className="h-4 w-4 mr-2" />
                <span className="flex-grow text-left">
                  {stayDates.checkIn
                    ? format(stayDates.checkIn, "MMM dd, yyyy")
                    : "Check-in"}
                </span>
                <Icons.ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                onSelectDate={(date) =>
                  setStayDates({ ...stayDates, checkIn: date })
                }
                onClose={() => {}}
                selectedDate={stayDates.checkIn}
                onAdjustDate={() => {}}
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between pl-3 pr-2"
              >
                <Icons.Calendar className="h-4 w-4 mr-2" />
                <span className="flex-grow text-left">
                  {stayDates.checkOut
                    ? format(stayDates.checkOut, "MMM dd, yyyy")
                    : "Check-out"}
                </span>
                <Icons.ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                onSelectDate={(date) =>
                  setStayDates({ ...stayDates, checkOut: date })
                }
                onClose={() => {}}
                selectedDate={stayDates.checkOut}
                onAdjustDate={() => {}}
              />
            </PopoverContent>
          </Popover>
        </motion.div>
      )}

      <motion.div layout className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => setCheckAccommodation(!checkAccommodation)}
          className="flex items-center"
        >
          <Icons.Bed className="mr-2 h-4 w-4" />
          Stays
        </Button>
        <div className="flex space-x-2">
          {tripType === "multi_city" && (
            <Button
              variant="outline"
              onClick={addFlightLeg}
              className="flex items-center"
            >
              <Icons.Plus className="mr-2 h-4 w-4" />
              Add Flight
            </Button>
          )}
          <Button onClick={handleCreateOfferRequest}>
            <Icons.Explore className="mr-2 h-4 w-4" />
            Explore
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
