"use client";

import type { exploreTravelSchema } from "@/actions/schema";
import { TravelLocation } from "@/components/travel-location";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@travelese/ui/form";
import { SubmitButton } from "@travelese/ui/submit-button";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

interface Props {
  form: UseFormReturn<z.infer<typeof exploreTravelSchema>>;
  onSubmit: (data: z.infer<typeof exploreTravelSchema>) => void;
  isSubmitting: boolean;
  defaultValues?: z.infer<typeof exploreTravelSchema>;
  onQueryParamsChange: (updates: z.infer<typeof exploreTravelSchema>) => void;
}

export function ExploreTravelForm({
  form,
  onSubmit,
  isSubmitting,
  defaultValues,
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
                    type="explore"
                    placeholder="Destination"
                    value={
                      field.value?.latitude && field.value?.longitude
                        ? `${field.value.latitude},${field.value.longitude}`
                        : ""
                    }
                    onChange={(value, iataCode, geoCode) => {
                      if (geoCode) {
                        field.onChange({
                          latitude: geoCode.latitude,
                          longitude: geoCode.longitude,
                        });
                        onQueryParamsChange({
                          explore: {
                            latitude: geoCode.latitude,
                            longitude: geoCode.longitude,
                          },
                        });
                      }
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
