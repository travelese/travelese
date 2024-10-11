"use client";

import { FlightsModal } from "@/components/modals/flights-modal";
import { Button } from "@travelese/ui/button";
import { Card, CardContent, CardFooter } from "@travelese/ui/card";
import { Dialog, DialogTrigger } from "@travelese/ui/dialog";
import { Separator } from "@travelese/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@travelese/ui/tooltip";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Maximize2,
  MonitorPlay,
  Power,
  RotateCcw,
  Ruler,
  Wifi,
} from "lucide-react";
import { useState } from "react";

export function FlightsWidgetSkeleton() {
  return null;
}

export function FlightsWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div className="p-2 sm:p-4">
      {flight && (
        <TooltipProvider>
          <Card className="w-full max-w-5xl font-mono rounded-none p-2 sm:p-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">
                  {flight.outbound.date} • Outbound
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center">
                      <span>{flight.outbound.airline.code}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={5}
                    className="rounded-none"
                  >
                    <p>{flight.outbound.airline.name}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xl font-bold">
                        {flight.outbound.from.code}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={5}
                      className="rounded-none"
                    >
                      <p>{flight.outbound.from.name}</p>
                    </TooltipContent>
                  </Tooltip>
                  <ArrowRight className="w-4 h-4" />
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xl font-bold">
                        {flight.outbound.to.code}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={5}
                      className="rounded-none"
                    >
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
              <Separator className="my-2 bg-zinc-700" />
              <div className="text-sm text-center my-2">
                {flight.stayDuration}
              </div>
              <Separator className="my-2 bg-zinc-700" />
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm">{flight.inbound.date} • Inbound</span>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center">
                      <span>{flight.inbound.airline.code}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={5}
                    className="rounded-none"
                  >
                    <p>{flight.inbound.airline.name}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xl font-bold">
                        {flight.inbound.from.code}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={5}
                      className="rounded-none"
                    >
                      <p>{flight.inbound.from.name}</p>
                    </TooltipContent>
                  </Tooltip>
                  <ArrowRight className="w-4 h-4" />
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xl font-bold">
                        {flight.inbound.to.code}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={5}
                      className="rounded-none"
                    >
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
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-300 hover:text-zinc-100 rounded-none"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <FlightsModal
                  flight={flight}
                  onClose={() => setIsModalOpen(false)}
                />
              </Dialog>
              <motion.div
                className="relative w-24 h-10"
                whileHover={{ rotateX: 180 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div
                  className="absolute w-full h-full flex items-center justify-center bg-zinc-700 text-zinc-100 rounded-none"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {flight.currency}
                  {flight.price}
                </motion.div>
                <motion.div
                  className="absolute w-full h-full flex items-center justify-center bg-zinc-600 text-zinc-100 rounded-none"
                  style={{ backfaceVisibility: "hidden", rotateX: 180 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-none w-full h-full"
                  >
                    Select
                  </Button>
                </motion.div>
              </motion.div>
            </CardFooter>
          </Card>
        </TooltipProvider>
      )}
    </div>
  );
}
