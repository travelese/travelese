"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icons } from "@travelese/ui/icons";
import { Button } from "@travelese/ui/button";
import { ShineBorder } from "@travelese/ui/shine-border";
import { TravelPeriod } from "@/components/travel/travel-period";
import { TravelCabin } from "@/components/travel/travel-cabin";
import { TravelTraveller } from "@/components/travel/travel-traveller";
import { TravelType } from "@/components/travel/travel-type";
import { TravelLocation } from "@/components/travel/travel-location";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@travelese/ui/form";
import { SubmitButton } from "@travelese/ui/submit-button";

// Define the schema for the form
const searchTravelSchema = z.object({
  travel_type: z.enum(["return", "one_way", "multi_city"]),
  cabin_class: z.enum([
    "economy",
    "premium_economy",
    "business",
    "first_class",
  ]),
  passengers: z.array(
    z.object({
      type: z.enum(["adult", "child", "infant_without_seat"]),
      given_name: z.string().optional(),
      family_name: z.string().optional(),
    }),
  ),
  slices: z.array(
    z.object({
      origin: z.string(),
      destination: z.string(),
      departure_date: z.string(),
    }),
  ),
});

type SearchTravelSchemaType = z.infer<typeof searchTravelSchema>;

export function FlightSearch() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<SearchTravelSchemaType>({
    resolver: zodResolver(searchTravelSchema),
    defaultValues: {
      travel_type: "return",
      cabin_class: "economy",
      passengers: [{ type: "adult" }],
      slices: [
        {
          origin: "",
          destination: "",
          departure_date: new Date().toISOString().split("T")[0],
        },
      ],
    },
  });

  // Watch form values
  const travelType = form.watch("travel_type");
  const slices = form.watch("slices");

  // Handle form submission
  const onSubmit = async (data: SearchTravelSchemaType) => {
    setIsSubmitting(true);
    try {
      // Implement your search logic here
      console.log("Search Data:", data);
      // Typically you'd call an API or navigation method here
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new flight segment for multi-city
  const addFlightSegment = () => {
    const currentSlices = form.getValues("slices");
    if (currentSlices.length < 3) {
      const newSlice = { origin: "", destination: "", departure_date: "" };
      form.setValue("slices", [...currentSlices, newSlice]);
    }
  };

  // Remove a flight segment
  const removeFlightSegment = (indexToRemove: number) => {
    const currentSlices = form.getValues("slices");
    if (currentSlices.length > 1) {
      const newSlices = currentSlices.filter(
        (_, index) => index !== indexToRemove,
      );
      form.setValue("slices", newSlices);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-black text-white flex flex-col items-center justify-center p-4 relative before:absolute before:inset-0 before:bg-[radial-gradient(#ffffff33_1px,transparent_1px)] before:bg-[size:20px_20px]">
      <div className="w-full max-w-4xl space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            Let&apos;s find your next flight!
          </h1>
          <p className="text-gray-400">
            To display available flights, please select your search options.
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
              <div className="w-full max-w-4xl rounded-2xl backdrop-blur-sm">
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="travel_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TravelType
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);

                              // Adjust slices based on travel type
                              const currentSlices = form.getValues("slices");
                              let newSlices: Array<{
                                origin: string;
                                destination: string;
                                departure_date: string;
                              }> = [];

                              if (value === "return") {
                                newSlices = [
                                  currentSlices[0] || {
                                    origin: "",
                                    destination: "",
                                    departure_date: "",
                                  },
                                  {
                                    origin: currentSlices[0]?.destination || "",
                                    destination: currentSlices[0]?.origin || "",
                                    departure_date: "",
                                  },
                                ];
                              } else if (value === "one_way") {
                                newSlices = [
                                  currentSlices[0] || {
                                    origin: "",
                                    destination: "",
                                    departure_date: "",
                                  },
                                ];
                              } else if (value === "multi_city") {
                                newSlices =
                                  currentSlices.length < 2
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
                            value={field.value}
                            onChange={field.onChange}
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
                            value={field.value}
                            onChange={field.onChange}
                            searchType="flights"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {slices.map((slice, index) => (
                <div
                  key={index}
                  className="w-full flex bg-[#313235] rounded-lg overflow-hidden px-4 py-1/2 space-x-4 items-center"
                >
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`slices.${index}.origin`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TravelLocation
                              placeholder="Where from?"
                              value={field.value}
                              onChange={(value, place) => {
                                field.onChange(place?.iata_code || value);
                              }}
                              type="origin"
                              searchType="flights"
                              disabled={isSubmitting}
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
                              placeholder="Where to?"
                              value={field.value}
                              onChange={(value, place) => {
                                field.onChange(place?.iata_code || value);
                              }}
                              type="destination"
                              searchType="flights"
                              disabled={isSubmitting}
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
                                  form.watch("travel_type") === "return" &&
                                    index === 0
                                    ? form.watch(`slices.1.departure_date`)
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

                                if (
                                  value.to &&
                                  index === 0 &&
                                  form.watch("travel_type") === "return"
                                ) {
                                  const firstSlice = form.getValues(
                                    `slices.${index}`,
                                  );
                                  form.setValue(`slices.1`, {
                                    departure_date: value.to,
                                    origin: firstSlice.destination,
                                    destination: firstSlice.origin,
                                  });
                                }
                              }}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {index === slices.length - 1 && (
                    <div className="flex items-center py-1">
                      <SubmitButton
                        isSubmitting={isSubmitting}
                        interactive
                        text="Search"
                      >
                        Search
                      </SubmitButton>

                      {travelType === "multi_city" && (
                        <div className="flex space-x-2 ml-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addFlightSegment}
                            disabled={slices.length >= 3 || isSubmitting}
                          >
                            Add Segment
                          </Button>
                          {slices.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeFlightSegment(index)}
                              disabled={isSubmitting}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </ShineBorder>
          </form>
        </Form>
      </div>
    </div>
  );
}