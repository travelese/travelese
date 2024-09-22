import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays, format, startOfTomorrow } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";
import { posthog } from "posthog-js";

const FlightFormSchema = z.object({
  origin: z.string().min(3),
  destination: z.string().min(3),
  dates: z.object({
    from: z.date(),
    to: z.date(),
  }),
  passengers: z.array(z.enum(["adult", "child", "infant_without_seat"])),
  cabin: z.enum(["first", "business", "premium_economy", "economy"]),
  sort: z.enum(["total_amount", "total_duration"]),
});

const StayFormSchema = z
  .object({
    check_in_date: z.date().refine((date) => date >= startOfTomorrow(), {
      message: "Check-in date must be tomorrow or later",
    }),
    check_out_date: z.date(),
    rooms: z.number().int().positive(),
    guests: z.array(z.enum(["adult", "child"])),
    location: z
      .object({
        geographic_coordinates: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        radius: z.number(),
      })
      .optional(),
  })
  .refine((data) => data.check_out_date > data.check_in_date, {
    message: "Check-out date must be after check-in date",
    path: ["check_out_date"],
  });

type SearchType = "fly" | "stay";

export function useSearchForm(
  type: SearchType,
  navigateToSearchPage: (queryParams: Record<string, string>) => void,
) {
  const [date, setDateState] = useState<DateRange | undefined>({
    from: type === "fly" ? new Date() : startOfTomorrow(),
    to: type === "fly" ? addDays(new Date(), 7) : addDays(startOfTomorrow(), 3),
  });

  const form = useForm<
    z.infer<typeof FlightFormSchema> | z.infer<typeof StayFormSchema>
  >({
    resolver:
      type === "fly"
        ? zodResolver(FlightFormSchema)
        : zodResolver(StayFormSchema),
    defaultValues:
      type === "fly"
        ? {
            origin: "",
            destination: "",
            dates: {
              from: new Date(),
              to: addDays(new Date(), 7),
            },
            passengers: ["adult"],
            cabin: "economy",
            sort: "total_amount",
          }
        : {
            check_in_date: startOfTomorrow(),
            check_out_date: addDays(startOfTomorrow(), 3),
            rooms: 1,
            guests: ["adult"],
            location: {
              geographic_coordinates: {
                latitude: 0,
                longitude: 0,
              },
              radius: 5,
            },
          },
  });

  const setDate = (newDate: DateRange | undefined) => {
    setDateState(newDate);
    if (newDate) {
      if (type === "fly") {
        form.setValue("dates", {
          from: newDate.from || new Date(),
          to: newDate.to || addDays(newDate.from || new Date(), 7),
        });
      } else {
        form.setValue("check_in_date", newDate.from || startOfTomorrow());
        form.setValue(
          "check_out_date",
          newDate.to || addDays(newDate.from || startOfTomorrow(), 1),
        );
      }
    }
  };

  useEffect(() => {
    if (type === "fly") {
      const { from, to } = form.getValues("dates");
      setDateState({ from, to });
    } else {
      const checkIn = form.getValues("check_in_date");
      const checkOut = form.getValues("check_out_date");
      setDate({ from: checkIn, to: checkOut });
    }
  }, [form, type]);

  const onSubmit = async (
    data: z.infer<typeof FlightFormSchema> | z.infer<typeof StayFormSchema>,
  ) => {
    try {
      if (type === "fly") {
        const { origin, destination, dates, cabin, passengers } =
          data as z.infer<typeof FlightFormSchema>;
        const formattedPassengers = passengers.map((type) => ({ type }));

        if (!origin || !destination) {
          toast.error("Please provide origin and destination");
          return;
        }

        const queryParams: Record<string, string> = {
          type: "fly",
          origin,
          destination,
          from: format(dates.from, "yyyy-MM-dd"),
          to: format(dates.to, "yyyy-MM-dd"),
          passengers: JSON.stringify(formattedPassengers),
          cabin,
        };

        posthog.capture("search_initiated", {
          searchType: "fly",
          searchParams: queryParams,
        });
        navigateToSearchPage(queryParams);
      } else {
        const { check_in_date, check_out_date, rooms, guests, location } =
          data as z.infer<typeof StayFormSchema>;
        const formattedGuests = guests.map((type) => ({ type }));
        if (
          !location ||
          !location.geographic_coordinates ||
          !location.geographic_coordinates.latitude ||
          !location.geographic_coordinates.longitude ||
          !location.radius
        ) {
          toast.error("Please select a valid location");
          return;
        }

        const queryParams: Record<string, string> = {
          type: "stay",
          check_in_date: format(check_in_date, "yyyy-MM-dd"),
          check_out_date: format(check_out_date, "yyyy-MM-dd"),
          rooms: rooms.toString(),
          guests: JSON.stringify(formattedGuests),
          latitude: location.geographic_coordinates.latitude.toString(),
          longitude: location.geographic_coordinates.longitude.toString(),
          radius: location.radius.toString(),
        };

        posthog.capture("search_initiated", {
          searchType: "stay",
          searchParams: queryParams,
        });

        navigateToSearchPage(queryParams);
      }
    } catch (error) {
      Sentry.captureException(error);
      handleError(error, type);
    }
  };

  const handleError = (error: unknown, searchType: "fly" | "stay") => {
    if (error instanceof Error) {
      toast.error(`Failed to search for ${searchType}`, {
        description: error.message,
      });
    } else {
      toast.error(`Failed to search for ${searchType}`, {
        description: "An unexpected error occurred",
      });
    }
  };

  return {
    form,
    date,
    setDate,
    onSubmit,
  };
}
