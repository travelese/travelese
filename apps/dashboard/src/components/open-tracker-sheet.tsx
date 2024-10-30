"use client";

import { useTrackerParams } from "@/hooks/use-tracker-params";
import { logger } from "@/utils/logger";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";

export function OpenTrackerSheet() {
  const { setParams } = useTrackerParams();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        setParams({ create: true });
      }}
    >
      <Icons.Add />
    </Button>
  );
}
