"use client";

import { createProjectAction } from "@/actions/project/create-project-action";
import { createProjectSchema } from "@/actions/schema";
import { TrackerProjectForm } from "@/components/forms/tracker-project-form";
import { useTrackerParams } from "@/hooks/use-tracker-params";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer, DrawerContent, DrawerHeader } from "@travelese/ui/drawer";
import { useMediaQuery } from "@travelese/ui/hooks";
import { ScrollArea } from "@travelese/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader } from "@travelese/ui/sheet";
import { useToast } from "@travelese/ui/use-toast";
import { useAction } from "next-safe-action/hooks";
import React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type Props = {
  currencyCode: string;
};

export function TrackerCreateSheet({ currencyCode }: Props) {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { setParams, create } = useTrackerParams();

  const isOpen = create;

  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      currency: currencyCode,
      status: "in_progress",
    },
  });

  const action = useAction(createProjectAction, {
    onSuccess: () => {
      setParams({ create: null });
      form.reset();
    },
    onError: () => {
      toast({
        duration: 3500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
  });

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={() => setParams({ create: null })}>
        <SheetContent>
          <SheetHeader className="mb-8 flex justify-between items-center flex-row">
            <h2 className="text-xl">Create Project</h2>
          </SheetHeader>

          <ScrollArea className="h-full p-0 pb-28" hideScrollbar>
            <TrackerProjectForm
              isSaving={action.status === "executing"}
              onSubmit={action.execute}
              form={form}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setParams({ create: null });
        }
      }}
    >
      <DrawerContent className="p-6">
        <DrawerHeader className="mb-8 flex justify-between items-center flex-row">
          <h2 className="text-xl">Create Project</h2>
        </DrawerHeader>

        <TrackerProjectForm
          isSaving={action.status === "executing"}
          onSubmit={action.execute}
          form={form}
        />
      </DrawerContent>
    </Drawer>
  );
}
