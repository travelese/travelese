"use client";

import {
  DatesField,
  DestinationField,
  RoomsField,
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
  location: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  guests: z.number(),
  rooms: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export function StaysSearchForm() {
  const [queryLocation, setQueryLocation] = useQueryState("location");
  const [queryCheckInDate, setQueryCheckInDate] = useQueryState("checkInDate");
  const [queryCheckOutDate, setQueryCheckOutDate] =
    useQueryState("checkOutDate");
  const [queryGuests, setQueryGuests] = useQueryState("guests");
  const [queryRooms, setQueryRooms] = useQueryState("rooms");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: queryLocation || "",
      checkInDate: queryCheckInDate || "",
      checkOutDate: queryCheckOutDate || "",
      guests: queryGuests ? Number.parseInt(queryGuests) : 1,
      rooms: queryRooms ? Number.parseInt(queryRooms) : 1,
    },
  });

  useEffect(() => {
    form.reset({
      location: queryLocation || "",
      checkInDate: queryCheckInDate || "",
      checkOutDate: queryCheckOutDate || "",
      guests: queryGuests ? Number.parseInt(queryGuests) : 1,
      rooms: queryRooms ? Number.parseInt(queryRooms) : 1,
    });
  }, [
    queryLocation,
    queryCheckInDate,
    queryCheckOutDate,
    queryGuests,
    queryRooms,
    form,
  ]);

  const onSubmit = async (data: FormValues) => {
    await setQueryLocation(data.location);
    await setQueryCheckInDate(data.checkInDate);
    await setQueryCheckOutDate(data.checkOutDate);
    await setQueryGuests(data.guests.toString());
    await setQueryRooms(data.rooms.toString());

    // Here you would typically trigger a search action
    console.log("Search submitted:", data);
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
              <DestinationField control={form.control} searchType="stays" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 flex-grow">
              <DatesField
                control={form.control}
                searchType="stays"
                date={form.watch("checkInDate")}
                onDateChange={form.setValue("checkInDate")}
              />
              <TravellersField control={form.control} searchType="stays" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <RoomsField control={form.control} />
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
