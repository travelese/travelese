import { Dialog, DialogContent } from "@travelese/ui/dialog";
import { Separator } from "@travelese/ui/separator";
import { SubmitButton } from "@travelese/ui/submit-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@travelese/ui/tooltip";
import { Fragment, useState } from "react";

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
  isOpen: boolean;
  onClose: () => void;
};

export function TravelModal({ flight, isOpen, onClose }: Props) {
  const handleOnOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="bg-background p-2">
          <div className="p-4">
            <div className="mb-8 space-y-5">
              <h2 className="font-medium text-xl">Flights</h2>
              <p className="text-[#878787] text-sm">Flights Details</p>
            </div>
            <div className="pb-8 relative h-[272px]">
              <Fragment />
            </div>
            <div className="flex justify-between mt-12 items-center">
              <div className="flex space-x-2">
                <Fragment />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
