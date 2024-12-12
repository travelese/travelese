"use client";

import { deleteTravellerAction } from "@/actions/delete-traveller-action";
import { useTravellerParams } from "@/hooks/use-traveller-params";
import { createClient } from "@travelese/supabase/client";
import { getTravellerQuery } from "@travelese/supabase/queries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@travelese/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@travelese/ui/dropdown-menu";
import { Icons } from "@travelese/ui/icons";
import { Sheet, SheetContent, SheetHeader } from "@travelese/ui/sheet";
import { useAction } from "next-safe-action/hooks";
import React, { useEffect, useState } from "react";
import { TravellerForm } from "../forms/traveller-form";
import type { Traveller } from "../invoice/taveller-details";

export function TravellerEditSheet() {
  const [traveller, setTraveller] = useState<Traveller | null>(null);
  const { setParams, travellerId } = useTravellerParams();

  const isOpen = Boolean(travellerId);
  const supabase = createClient();

  const deleteTraveller = useAction(deleteTravellerAction, {
    onSuccess: () => {
      setParams({
        travellerId: null,
      });
    },
  });

  useEffect(() => {
    async function fetchTraveller() {
      if (travellerId) {
        const { data } = await getTravellerQuery(supabase, travellerId);
        if (data) {
          setTraveller(data as Traveller);
        }
      }
    }

    if (travellerId) {
      fetchTraveller();
    }
  }, [travellerId, supabase]);

  return (
    <Sheet open={isOpen} onOpenChange={() => setParams(null)}>
      <SheetContent stack>
        <SheetHeader className="mb-6 flex justify-between items-center flex-row">
          <h2 className="text-xl">Edit Traveller</h2>

          {travellerId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button">
                  <Icons.MoreVertical className="size-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={10} align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the traveller and remove their data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          deleteTraveller.execute({ id: travellerId })
                        }
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SheetHeader>

        <TravellerForm data={traveller} />
      </SheetContent>
    </Sheet>
  );
}
