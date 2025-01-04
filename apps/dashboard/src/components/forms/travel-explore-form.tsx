"use client";

import type { FlightPositionsRequest } from "@/actions/schema";
import { TravelLocation } from "@/components/travel/travel-location";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@travelese/ui/form";
import { SubmitButton } from "@travelese/ui/submit-button";
import type { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<FlightPositionsRequest>;
  onSubmit: (data: FlightPositionsRequest) => void;
  isSubmitting: boolean;
  defaultValues?: FlightPositionsRequest;
  onQueryParamsChange: (updates: FlightPositionsRequest) => void;
}

export function TravelExploreForm({
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
            name="geo_code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TravelLocation
                    type="destination"
                    placeholder="Destination"
                    value={
                      field.value
                        ? `${field.value.latitude}, ${field.value.longitude}`
                        : ""
                    }
                    onChange={(value, place) => {
                      field.onChange({
                        latitude: place?.latitude || 0,
                        longitude: place?.longitude || 0,
                      });
                      onQueryParamsChange({
                        geo_code: {
                          latitude: place?.latitude || 0,
                          longitude: place?.longitude || 0,
                        },
                        iata_code: place?.iata_code || "",
                      });
                    }}
                    searchType="flights"
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
