"use client";

import { TravelSearchCard } from "@/components/travel-search-card";
import { Drawer, DrawerContent } from "@travelese/ui/drawer";
import { useMediaQuery } from "@travelese/ui/hooks";
import { ScrollArea } from "@travelese/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@travelese/ui/sheet";
import { useQueryState } from "nuqs";

export function TravelSearchSheet({
  userId,
  currency,
}: {
  categories: any;
  userId: string;
  accountId: string;
  currency: string;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useQueryState("create");

  const isOpen = Boolean(open);

  const handleOpenChange = (open: boolean) => {
    setOpen(open ? "true" : null);
  };

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent>
          <SheetHeader className="mb-8">
            <SheetTitle>Explore</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-full p-0 pb-[100px]" hideScrollbar>
            <TravelSearchCard userId={userId} currency={currency} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="p-6">
        <TravelSearchCard userId={userId} currency={currency} />
      </DrawerContent>
    </Drawer>
  );
}
