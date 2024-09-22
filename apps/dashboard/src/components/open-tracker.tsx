"use client";

import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { useQueryState } from "nuqs";

export function OpenTracker() {
  const [_, setOpen] = useQueryState("create");

  return (
    <div>
      <Button variant="outline" size="icon" onClick={() => setOpen("project")}>
        <Icons.Add />
      </Button>
    </div>
  );
}
