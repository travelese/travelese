"use client";

import { useTravellerParams } from "@/hooks/use-traveller-params";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Sheet, SheetContent, SheetHeader } from "@travelese/ui/sheet";
import React from "react";
import { TravellerForm } from "../forms/traveller-form";

export function TravellerCreateSheet() {
  const { setParams, createTraveller } = useTravellerParams();

  const isOpen = Boolean(createTraveller);

  return (
    <Sheet open={isOpen} onOpenChange={() => setParams(null)}>
      <SheetContent stack>
        <SheetHeader className="mb-6 flex justify-between items-center flex-row">
          <h2 className="text-xl">Create Traveller</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setParams(null)}
            className="p-0 m-0 size-auto hover:bg-transparent"
          >
            <Icons.Close className="size-5" />
          </Button>
        </SheetHeader>

        <TravellerForm />
      </SheetContent>
    </Sheet>
  );
}
