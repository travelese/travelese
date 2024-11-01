"use client";

import type { searchTravelSchema } from "@/actions/schema";
import { TravelBaggage } from "@/components/travel/travel-baggage";
import { TravelCabin } from "@/components/travel/travel-cabin";
import { TravelLocation } from "@/components/travel/travel-location";
import { TravelPeriod } from "@/components/travel/travel-period";
import { TravelTraveller } from "@/components/travel/travel-traveller";
import { TravelType } from "@/components/travel/travel-type";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { type UseFormReturn, useForm } from "react-hook-form";
import type { z } from "zod";

interface Props {
  form: UseFormReturn<z.infer<typeof searchTravelSchema>>;
  onSubmit: (data: z.infer<typeof searchTravelSchema>) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<z.infer<typeof searchTravelSchema>>;
  searchType: "flights" | "stays";
  onQueryParamsChange: (
    updates: Partial<z.infer<typeof searchTravelSchema>>,
  ) => void;
}

export function SearchTravelForm({
  form,
  onSubmit,
  isSubmitting,
  defaultValues,
  searchType,
  onQueryParamsChange,
}: Props) {
  const isFlights = searchType === "flights";

  const addFlightSegment = () => {
    const currentSlices = form.getValues("slices");
    if (currentSlices && currentSlices.length < 3) {
      const newSlice = { origin: "", destination: "", departure_date: "" };
      form.setValue("slices", [...currentSlices, newSlice]);
      onQueryParamsChange({ slices: [...currentSlices, newSlice] });
    }
  };

  const removeFlightSegment = (indexToRemove: number) => {
    const currentSlices = form.getValues("slices");
    if (currentSlices && currentSlices.length > 1) {
      const newSlices = currentSlices.filter(
        (_, index) => index !== indexToRemove,
      );
      form.setValue("slices", newSlices);
      onQueryParamsChange({ slices: newSlices });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 mx-auto max-w-4xl">
          {isFlights && (
            <>
              <FormField
                control={form.control}
                name="travel_type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TravelType
                        value={
                          field.value as "one_way" | "return" | "multi_city"
                        }
                        onChange={(value) => {
                          field.onChange(value);
                          onQueryParamsChange({ travel_type: value });

                          const currentSlices = form.getValues("slices");
                          let newSlices: Array<{
                            origin: string;
                            destination: string;
                            departure_date: string;
                          }> = [];

                          if (value === "return") {
                            newSlices = [
                              currentSlices?.[0] || {
                                origin: "",
                                destination: "",
                                departure_date: "",
                              },
                              {
                                origin: currentSlices?.[0]?.destination || "",
                                destination: currentSlices?.[0]?.origin || "",
                                departure_date: "",
                              },
                            ];
                          } else if (value === "one_way") {
                            newSlices = [
                              currentSlices?.[0] || {
                                origin: "",
                                destination: "",
                                departure_date: "",
                              },
                            ];
                          } else if (value === "multi_city") {
                            newSlices =
                              currentSlices && currentSlices.length < 2
                                ? [
                                    ...currentSlices,
                                    {
                                      origin: "",
                                      destination: "",
                                      departure_date: "",
                                    },
                                  ]
                                : currentSlices;
                          }

                          form.setValue("slices", newSlices);
                          onQueryParamsChange({ slices: newSlices });
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cabin_class"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TravelCabin
                        value={
                          field.value as
                            | "economy"
                            | "premium_economy"
                            | "business"
                            | "first_class"
                        }
                        onChange={(value) => {
                          field.onChange(value);
                          onQueryParamsChange({ cabin_class: value });
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passengers"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TravelTraveller
                        value={
                          field.value as Array<{
                            type: "adult" | "child" | "infant_without_seat";
                            given_name: string;
                            family_name: string;
                          }>
                        }
                        onChange={(value) => {
                          field.onChange(value);
                          onQueryParamsChange({ passengers: value });
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bags"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TravelBaggage
                        value={
                          field.value as {
                            carry_on: number;
                            cabin: number;
                            checked: number;
                          }
                        }
                        onChange={(value) => {
                          field.onChange(value);
                          onQueryParamsChange({ bags: value });
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 mx-auto max-w-4xl">
            {form.watch("slices")?.map((slice, index) => (
              <div
                key={index}
                className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-2"
              >
                {(form.watch("travel_type") === "multi_city" ||
                  index === 0) && (
                  <>
                    <FormField
                      control={form.control}
                      name={`slices.${index}.origin`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TravelLocation
                              type="origin"
                              placeholder="Origin"
                              value={field.value}
                              onChange={(value, iataCode) => {
                                field.onChange(iataCode);
                                onQueryParamsChange({
                                  slices: form
                                    .getValues("slices")
                                    ?.map((s, i) =>
                                      i === index
                                        ? { ...s, origin: iataCode }
                                        : s,
                                    ),
                                });
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`slices.${index}.destination`}
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
                                  slices: form
                                    .getValues("slices")
                                    ?.map((s, i) =>
                                      i === index
                                        ? { ...s, destination: iataCode }
                                        : s,
                                    ),
                                });
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`slices.${index}.departure_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TravelPeriod
                              value={{
                                from: field.value,
                                to:
                                  form.watch("travel_type") === "return" &&
                                  index === 0
                                    ? form.watch(
                                        `slices.${index + 1}.departure_date`,
                                      )
                                    : undefined,
                              }}
                              travelType={
                                form.watch("travel_type") as
                                  | "one_way"
                                  | "return"
                                  | "multi_city"
                              }
                              index={index}
                              onChange={(value) => {
                                field.onChange(value.from);
                                const updates = {
                                  slices: form
                                    .getValues("slices")
                                    .map((s, i) =>
                                      i === index
                                        ? { ...s, departure_date: value.from }
                                        : form.watch("travel_type") ===
                                              "return" &&
                                            i === index + 1 &&
                                            value.to
                                          ? {
                                              ...s,
                                              departure_date: value.to,
                                              origin: form.getValues(
                                                `slices.${index}.destination`,
                                              ),
                                              destination: form.getValues(
                                                `slices.${index}.origin`,
                                              ),
                                            }
                                          : s,
                                    ),
                                };
                                onQueryParamsChange(updates);

                                if (
                                  value.to &&
                                  index === 0 &&
                                  form.watch("travel_type") === "return"
                                ) {
                                  const firstSlice = form.getValues(
                                    `slices.${index}`,
                                  );
                                  form.setValue(`slices.${index + 1}`, {
                                    departure_date: value.to,
                                    origin: firstSlice.destination,
                                    destination: firstSlice.origin,
                                  });
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          {isFlights && (
            <>
              {form.watch("travel_type") === "multi_city" &&
                index === (form.watch("slices")?.length || 0) - 1 && (
                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => removeFlightSegment(index)}
                      disabled={
                        form.watch("slices") &&
                        (form.watch("slices")?.length || 0) <= 1
                      }
                      className="w-10 h-10 flex-1"
                    >
                      <Icons.Close className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={addFlightSegment}
                      disabled={
                        form.watch("slices") &&
                        (form.watch("slices")?.length || 0) >= 3
                      }
                      className="w-10 h-10 flex-1"
                    >
                      <Icons.Plus className="h-4 w-4" />
                    </Button>
                    <SubmitButton
                      isSubmitting={isSubmitting}
                      size="icon"
                      className="w-10 h-10 flex-1"
                    >
                      <Icons.Travel className="h-4 w-4" />
                    </SubmitButton>
                  </div>
                )}

              {((form.watch("travel_type") !== "multi_city" &&
                index === (form.watch("slices")?.length || 0) - 1) ||
                (form.watch("travel_type") === "return" && index === 0)) && (
                <SubmitButton isSubmitting={isSubmitting} className="w-full">
                  Search
                </SubmitButton>
              )}
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
