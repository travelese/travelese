import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@travelese/ui/dialog";
import { Separator } from "@travelese/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@travelese/ui/tooltip";

type FlightType = {
  outbound: {
    airline: { name: string; code: string };
    flightNo: string;
    stops: number;
    connection: { airport: string; layoverDuration: string };
    amenities: Array<{
      icon: React.ComponentType;
      label: string;
      value: string;
    }>;
  };
  inbound: {
    airline: { name: string; code: string };
    flightNo: string;
    stops: number;
    amenities: Array<{
      icon: React.ComponentType;
      label: string;
      value: string;
    }>;
  };
};

type Props = {
  flight: FlightType;
  onClose: () => void;
};

export function FlightsModal({ flight, onClose }: Props) {
  if (!flight) return null;

  return (
    <DialogContent className="max-w-[455px]">
      <div className="p-4">
        <DialogHeader>
          <DialogTitle>Flights</DialogTitle>
          <DialogDescription>Flights Details</DialogDescription>
        </DialogHeader>

        <div className="bg-background p-2">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Outbound</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Airline:</span>
                <span>{flight.outbound.airline.name}</span>
                <span>Flight No:</span>
                <span>
                  {flight.outbound.airline.code} {flight.outbound.flightNo}
                </span>
                <span>Stops:</span>
                <span>{flight.outbound.stops}</span>
              </div>
            </div>
            <Separator className="bg-zinc-600" />
            <div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Connection:</span>
                <span>
                  {flight.outbound.connection.airport} (
                  {flight.outbound.connection.layoverDuration} layover)
                </span>
              </div>
            </div>
            <Separator className="bg-zinc-600" />
            <div>
              <h3 className="font-bold mb-2">Outbound Amenities</h3>
              <div className="flex justify-around">
                {flight.outbound.amenities.map((amenity, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger>
                      <amenity.icon className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent className="rounded-none">
                      <p>
                        {amenity.label}: {amenity.value}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
            <Separator className="bg-zinc-600" />
            <div>
              <h3 className="font-bold mb-2">Inbound</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Airline:</span>
                <span>{flight.inbound.airline.name}</span>
                <span>Flight No:</span>
                <span>
                  {flight.inbound.airline.code} {flight.inbound.flightNo}
                </span>
                <span>Stops:</span>
                <span>{flight.inbound.stops}</span>
              </div>
            </div>
            <Separator className="bg-zinc-600" />
            <div>
              <h3 className="font-bold mb-2">Inbound Amenities</h3>
              <div className="flex justify-around">
                {flight.inbound.amenities.map((amenity, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger>
                      <amenity.icon className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent className="rounded-none">
                      <p>
                        {amenity.label}: {amenity.value}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
