"use client";

import { TravelLocation } from "@/components/travel-location";
import { Button } from "@travelese/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@travelese/ui/form";
import { Icons } from "@travelese/ui/icons";
import { SubmitButton } from "@travelese/ui/submit-button";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

interface Props {
  form: UseFormReturn;
  onSubmit: () => void;
  isSubmitting: boolean;
  onQueryParamsChange: (updates: Partial<Record<string, string>>) => void;
}

export function ExploreTravelForm({
  form,
  onSubmit,
  isSubmitting,
  onQueryParamsChange,
}: Props) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-2 mb-3 mx-auto max-w-4xl">
          <FormField
            control={form.control}
            name="explore"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TravelLocation
                    type="destination"
                    placeholder="Destination"
                    value={field.value}
                    onChange={(value, iataCode) => {
                      field.onChange(iataCode);
                      onQueryParamsChange({
                        explore: iataCode,
                      });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="fixed bottom-8 w-full sm:max-w-[455px] right-8">
            <SubmitButton className="w-full" isSubmitting={isSubmitting}>
              Explore Flights
            </SubmitButton>
          </div>
        </div>
      </form>
    </Form>
  );
}
