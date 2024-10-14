"use client";

import { Badge } from "@travelese/ui/badge";
import { Icons } from "@travelese/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@travelese/ui/tooltip";
import {
  ArrowRight,
  Maximize2,
  MonitorPlay,
  Power,
  RotateCcw,
  Ruler,
  Wifi,
} from "lucide-react";

export function TravelListSkeleton() {
  return null;
}

export function TravelList() {
  const flight = {
    outbound: {
      date: "Thu 14 Nov",
      from: {
        code: "YYZ",
        name: "Toronto Pearson International Airport",
      },
      to: {
        code: "HND",
        name: "Tokyo Haneda International Airport",
      },
      departureTime: "11:00",
      arrivalTime: "17:45",
      duration: "16h 45m",
      stops: 1,
      airline: { code: "UA", name: "United Airlines" },
      flightNo: "1063",
      connection: {
        airport: "ORD",
        layoverDuration: "1h 11m",
      },
      amenities: [
        { icon: Ruler, label: "Seat pitch", value: "76 cm" },
        { icon: Maximize2, label: "Seat width", value: "42-45 cm" },
        { icon: RotateCcw, label: "Seat recline", value: "5 cm" },
        {
          icon: MonitorPlay,
          label: "Entertainment",
          value: "Audio & video on demand",
        },
        { icon: Power, label: "Power", value: "AC_USB" },
        { icon: Wifi, label: "Wi-Fi", value: "No" },
      ],
    },
    inbound: {
      date: "Sun 17 Nov",
      from: {
        code: "HND",
        name: "Tokyo Haneda International Airport",
      },
      to: {
        code: "YYZ",
        name: "Toronto Pearson International Airport",
      },
      departureTime: "16:50",
      arrivalTime: "18:57",
      duration: "16h 07m",
      stops: 1,
      airline: { code: "UA", name: "United Airlines" },
      flightNo: "1064",
      amenities: [
        { icon: Ruler, label: "Seat pitch", value: "76 cm" },
        { icon: Maximize2, label: "Seat width", value: "42-45 cm" },
        { icon: RotateCcw, label: "Seat recline", value: "5 cm" },
        {
          icon: MonitorPlay,
          label: "Entertainment",
          value: "Audio & video on demand",
        },
        { icon: Power, label: "Power", value: "AC_USB" },
        { icon: Wifi, label: "Wi-Fi", value: "No" },
      ],
    },
    price: 1195,
    currency: "CA$",
    stayDuration: "2 nights in Tokyo",
  };

  return (
    <>
      {flight && (
        <TooltipProvider>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">{flight.outbound.date} • Outbound</span>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center">
                    <span>{flight.outbound.airline.code}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{flight.outbound.airline.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center">
                      <span>{flight.outbound.from.code}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{flight.outbound.from.name}</p>
                  </TooltipContent>
                </Tooltip>
                <ArrowRight className="w-4 h-4" />
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center">
                      <span>{flight.outbound.to.code}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{flight.outbound.to.name}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm">{flight.outbound.duration}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>{flight.outbound.departureTime}</span>
              <span>{flight.outbound.arrivalTime}</span>
            </div>
            <div className="flex justify-center my-2">
              <Badge variant="secondary" className="text-sm text-center">
                {flight.stayDuration}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">{flight.inbound.date} • Inbound</span>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center">
                    <span>{flight.inbound.airline.code}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{flight.inbound.airline.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center">
                      <span>{flight.inbound.from.code}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{flight.inbound.from.name}</p>
                  </TooltipContent>
                </Tooltip>
                <ArrowRight className="w-4 h-4" />
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center">
                      <span>{flight.inbound.to.code}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{flight.inbound.to.name}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm">{flight.inbound.duration}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>{flight.inbound.departureTime}</span>
              <span>{flight.inbound.arrivalTime}</span>
            </div>
          </div>
        </TooltipProvider>
      )}
    </>
  );
}
