"use client";

import { ShareTravel } from "@/components/share-travel";
import { Button } from "@travelese/ui/button";
import { Dialog } from "@travelese/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@travelese/ui/dropdown-menu";
import { Icons } from "@travelese/ui/icons";
import { useState } from "react";

type Props = {
  defaultValue: {
    from: string;
    to: string;
    type: "one_way" | "return" | "multi_city" | "nomad";
  };
  type: "one_way" | "return" | "multi_city" | "nomad";
};

export function TravelMore({ defaultValue, type }: Props) {
  const [isOpen, setOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Icons.MoreHoriz size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={10} align="end">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Share travel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareTravel defaultValue={defaultValue} type={type} setOpen={setOpen} />
    </Dialog>
  );
}
