"use client";

import { FlightsModal } from "@/components/modals/flights-modal";
import { Button } from "@travelese/ui/button";
import { Dialog, DialogTrigger } from "@travelese/ui/dialog";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Suspense } from "react";
import { FlightsWidget } from "./flights-widget";

interface Flight {
  id: string;
}

export function Flights() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flight, setFlight] = useState<Flight | null>(null);

  return (
    <div className="border aspect-square overflow-hidden relative flex flex-col p-4 md:p-8">
      <h2 className="text-lg">Flights</h2>
      <div className="space-y-4 flex justify-between items-center">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <FlightsModal flight={flight} onClose={() => setIsModalOpen(false)} />
        </Dialog>
      </div>
      <Button variant="ghost" size="sm" className="rounded-none w-full h-full">
        Select
      </Button>
      <Suspense>
        <FlightsWidget />
      </Suspense>
    </div>
  );
}
