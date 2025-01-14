"use client";

import type { searchTravelSchema } from "@/actions/schema";
import { TravelBaggage } from "@/components//travel/travel-baggage";
import { TravelCabin } from "@/components/travel/travel-cabin";
import { TravelLocation } from "@/components/travel/travel-location";
import { TravelPeriod } from "@/components/travel/travel-period";
import { TravelRooms } from "@/components/travel/travel-rooms";
import { TravelTraveller } from "@/components/travel/travel-traveller";
import { TravelType } from "@/components/travel/travel-type";
import { Button } from "@travelese/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@travelese/ui/form";
import { Icons } from "@travelese/ui/icons";
import { ShineBorder } from "@travelese/ui/shine-border";
import { SubmitButton } from "@travelese/ui/submit-button";
import type { UseFormReturn } from "react-hook-form";
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

export function TravelSearchForm({
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
    <div className="min-h-[calc(100vh-100px)] bg-black text-white flex flex-col items-center justify-center p-4 relative before:absolute before:inset-0 before:bg-[radial-gradient(#ffffff33_1px,transparent_1px)] before:bg-[size:20px_20px]">
      <div className="w-full max-w-4xl space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            {isFlights
              ? "Let's find your next flight!"
              : "Find your perfect stay"}
          </h1>
          <p className="text-gray-400">
            {isFlights
              ? "To display available flights, please select your search options."
              : "Select your destination and travel dates to find the perfect accommodation."}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ShineBorder
              borderRadius={12}
              borderWidth={1}
              duration={10}
              color={["#ffffff33", "#ffffff66"]}
              className="w-full bg-zinc-900/50 space-y-4"
            >
              {isFlights ? (
                // Flights Search Form
                <>
                  <div className="w-full max-w-4xl rounded-2xl backdrop-blur-sm">
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="travel_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <TravelType
                                value={
                                  field.value as
                                    | "one_way"
                                    | "return"
                                    | "multi_city"
                                }
                                onChange={(value) => {
                                  field.onChange(value);
                                  onQueryParamsChange({ travel_type: value });

                                  const currentSlices =
                                    form.getValues("slices");
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
                                        origin:
                                          currentSlices?.[0]?.destination || "",
                                        destination:
                                          currentSlices?.[0]?.origin || "",
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
                        name={isFlights ? "passengers" : "guests"}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <TravelTraveller
                                value={
                                  field.value as Array<{
                                    type:
                                      | "adult"
                                      | "child"
                                      | "infant_without_seat";
                                    given_name: string;
                                    family_name: string;
                                  }>
                                }
                                onChange={(value) => {
                                  field.onChange(value);
                                  onQueryParamsChange(
                                    isFlights
                                      ? { passengers: value }
                                      : { guests: value },
                                  );
                                }}
                                disabled={isSubmitting}
                                searchType={searchType}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {form.watch("slices")?.map((slice, index) => (
                    <div
                      key={index}
                      className="w-full flex bg-[#313235] rounded-lg overflow-hidden px-4 py-1/2 space-x-4 items-center"
                    >
                      {(form.watch("travel_type") === "multi_city" ||
                        index === 0) && (
                        <>
                          <div className="flex-1">
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
                                      onChange={(value, place) => {
                                        field.onChange(value, place);
                                        onQueryParamsChange({
                                          slices: form
                                            .getValues("slices")
                                            ?.map((s, i) =>
                                              i === index
                                                ? {
                                                    ...s,
                                                    origin: place?.iata_code,
                                                  }
                                                : s,
                                            ),
                                        });
                                      }}
                                      searchType={searchType}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full hover:bg-white/5"
                          >
                            <Icons.ArrowRotate className="size-4" />
                          </Button>

                          <div className="flex-1">
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
                                      onChange={(value, place) => {
                                        field.onChange(value);
                                        onQueryParamsChange({
                                          slices: form
                                            .getValues("slices")
                                            ?.map((s, i) =>
                                              i === index
                                                ? {
                                                    ...s,
                                                    destination:
                                                      place?.iata_code,
                                                  }
                                                : s,
                                            ),
                                        });
                                      }}
                                      searchType={searchType}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex-1">
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
                                          form.watch("travel_type") ===
                                            "return" && index === 0
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
                                                ? {
                                                    ...s,
                                                    departure_date: value.from,
                                                  }
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
                                                      destination:
                                                        form.getValues(
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
                          </div>
                          <div className="flex items-center py-1">
                            {form.watch("travel_type") === "multi_city" &&
                              index ===
                                (form.watch("slices")?.length || 0) - 1 && (
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
                                    <Icons.Close className="size-4" />
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
                                    <Icons.Plus className="size-4" />
                                  </Button>
                                  <SubmitButton
                                    isSubmitting={isSubmitting}
                                    size="icon"
                                    className="w-10 h-10 flex-1"
                                  >
                                    <Icons.Travel className="size-4" />
                                  </SubmitButton>
                                </div>
                              )}

                            {((form.watch("travel_type") !== "multi_city" &&
                              index ===
                                (form.watch("slices")?.length || 0) - 1) ||
                              (form.watch("travel_type") === "return" &&
                                index === 0)) && (
                              <SubmitButton
                                className="w-full"
                                isSubmitting={isSubmitting}
                              >
                                {isFlights ? "Search Flights" : "Search Stays"}
                              </SubmitButton>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                // Stays Search Form
                <>
                  <div className="grid grid-cols-2 gap-2 mb-3 mx-auto max-w-4xl">
                    <FormField
                      control={form.control}
                      name="guests"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TravelTraveller
                              value={
                                field.value as Array<{
                                  type:
                                    | "adult"
                                    | "child"
                                    | "infant_without_seat";
                                  given_name: string;
                                  family_name: string;
                                }>
                              }
                              onChange={(value) => {
                                field.onChange(value);
                                onQueryParamsChange(
                                  isFlights
                                    ? { passengers: value }
                                    : { guests: value },
                                );
                              }}
                              disabled={isSubmitting}
                              searchType={searchType}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TravelRooms
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                onQueryParamsChange({ rooms: value });
                              }}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2 mb-3 mx-auto max-w-4xl">
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TravelLocation
                              type="destination"
                              placeholder="Destination"
                              value={field.value}
                              onChange={(value, place) => {
                                field.onChange(value);
                                onQueryParamsChange({
                                  destination: place?.iata_code,
                                });
                              }}
                              searchType={searchType}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="travel_period"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TravelPeriod
                              value={{
                                from: field.value?.from,
                                to: field.value?.to,
                              }}
                              onChange={(value) => {
                                field.onChange(value);
                                onQueryParamsChange({ travel_period: value });
                              }}
                              travelType="return"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="fixed bottom-8 w-full sm:max-w-[455px] right-8">
                      <SubmitButton
                        className="w-full"
                        isSubmitting={isSubmitting}
                      >
                        {isFlights ? "Search Flights" : "Search Stays"}
                      </SubmitButton>
                    </div>
                  </div>
                </>
              )}
            </ShineBorder>
          </form>
        </Form>
      </div>
    </div>
  );
}
