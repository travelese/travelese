"use client";

import { useTravelParams } from "@/hooks/use-travel-params";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";

export function OpenTravelSheet() {
  const { setParams } = useTravelParams();

  return (
    <div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setParams({ create: true })}
      >
        <Icons.Add />
      </Button>
    </div>
  );
}
