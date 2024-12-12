"use client";

import { useTravellerParams } from "@/hooks/use-traveller-params";
import { useInvoiceParams } from "@/hooks/use-invoice-params";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";

export function OpenTravellerSheet() {
  const { setParams } = useTravellerParams();

  return (
    <div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setParams({ createTraveller: true })}
      >
        <Icons.Add />
      </Button>
    </div>
  );
}
