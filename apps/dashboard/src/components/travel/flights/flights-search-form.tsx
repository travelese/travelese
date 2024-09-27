"use client";

import { createPartialOfferRequestAction } from "@/actions/travel/flights/create-partial-offer-request-action";
import {
  CabinField,
  DatesField,
  DestinationField,
  OriginField,
  TravellersField,
} from "@/components/travel/search-form-fields";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@travelese/ui/button";
import { Form } from "@travelese/ui/form";
import { SearchIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  departure_date: z.string(),
  return_date: z.string().optional(),
  passengers: z.array(
    z.object({
      type: z.enum(["adult", "child", "infant_without_seat"]),
      age: z.number().optional(),
    }),
  ),
  cabin_class: z.enum(["economy", "premium_economy", "business", "first"]),
});

type FormValues = z.infer<typeof formSchema>;

export function FlightsSearchForm() {
  const [queryOrigin, setQueryOrigin] = useQueryState("origin");
  const [queryDestination, setQueryDestination] = useQueryState("destination");
  const [queryDepartureDate, setQueryDepartureDate] =
    useQueryState("departureDate");
  const [queryReturnDate, setQueryReturnDate] = useQueryState("returnDate");
  const [queryPassengers, setQueryPassengers] = useQueryState("passengers");
  const [queryCabinClass, setQueryCabinClass] = useQueryState("cabinClass");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: queryOrigin || "",
      destination: queryDestination || "",
      departure_date: queryDepartureDate || "",
      return_date: queryReturnDate || undefined,
      passengers: queryPassengers
        ? JSON.parse(queryPassengers)
        : [{ type: "adult" }],
      cabin_class: (queryCabinClass as FormValues["cabin_class"]) || "economy",
    },
  });

  useEffect(() => {
    form.reset({
      origin: queryOrigin || "",
      destination: queryDestination || "",
      departure_date: queryDepartureDate || "",
      return_date: queryReturnDate || undefined,
      passengers: queryPassengers
        ? JSON.parse(queryPassengers)
        : [{ type: "adult" }],
      cabin_class: (queryCabinClass as FormValues["cabin_class"]) || "economy",
    });
  }, [
    queryOrigin,
    queryDestination,
    queryDepartureDate,
    queryReturnDate,
    queryPassengers,
    queryCabinClass,
    form,
  ]);

  const onSubmit = async (data: FormValues) => {
    await setQueryOrigin(data.origin);
    await setQueryDestination(data.destination);
    await setQueryDepartureDate(data.departure_date);
    await setQueryReturnDate(data.return_date || null);
    await setQueryPassengers(JSON.stringify(data.passengers));
    await setQueryCabinClass(data.cabin_class);

    const result = await createPartialOfferRequestAction({ parsedInput: data });
    if (result.success) {
      // Handle successful search
      console.log("Partial offer request created:", result.data);
    } else {
      // Handle error
      console.error("Failed to create partial offer request:", result.error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col sm:flex-row lg:flex-row xl:flex-row gap-2 p-4"
          >
            <div className="flex flex-col sm:flex-row gap-1 flex-grow">
              <OriginField control={form.control} />
              <DestinationField control={form.control} />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 flex-grow">
              <DatesField
                control={form.control}
                departureName="departure_date"
                returnName="return_date"
              />
              <TravellersField control={form.control} name="passengers" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <CabinField control={form.control} name="cabin_class" />
              <div className="flex-1 w-full min-w-[100px]">
                <Button type="submit" className="w-full h-full">
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
