"use client";

import { CreateTransactionForm } from "@/components/forms/create-transaction-form";
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

export function CreateTransactionSheet({
  categories,
  userId,
  accountId,
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
            <SheetTitle>Create Transaction</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-full p-0 pb-[100px]" hideScrollbar>
            <CreateTransactionForm
              categories={categories}
              userId={userId}
              accountId={accountId}
              currency={currency}
              onCreate={() => setOpen(null)}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="p-6">
        <CreateTransactionForm
          categories={categories}
          userId={userId}
          accountId={accountId}
          currency={currency}
          onCreate={() => setOpen(null)}
        />
      </DrawerContent>
    </Drawer>
  );
}
