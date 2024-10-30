import { NEW_EVENT_ID } from "@/utils/travel";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@travelese/ui/form";
import { Input } from "@travelese/ui/input";
import { SubmitButton } from "@travelese/ui/submit-button";
import { TimeRangeInput } from "@travelese/ui/time-range-input";
import { differenceInSeconds, parse } from "date-fns";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AssignUser } from "../assign-user";
import { TravelSelectBooking } from "../travel-select-booking";

const formSchema = z.object({
  id: z.string().optional(),
  duration: z.number().min(1),
  booking_id: z.string(),
  assigned_id: z.string().optional(),
  description: z.string().optional(),
  start: z.string(),
  end: z.string(),
});

type Props = {
  eventId?: string;
  userId: string;
  teamId: string;
  onCreate: (values: z.infer<typeof formSchema>) => void;
  bookingId?: string | null;
  start?: string;
  end?: string;
  onSelectBooking: (selected: { id: string; name: string }) => void;
  description?: string;
  isSaving: boolean;
};

export function TravelBookingForm({
  eventId,
  userId,
  teamId,
  onCreate,
  bookingId,
  start,
  end,
  onSelectBooking,
  description,
  isSaving,
}: Props) {
  const isUpdate = eventId && eventId !== NEW_EVENT_ID;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: eventId,
      assigned_id: userId,
      booking_id: bookingId,
      start,
      end,
      description: description ?? undefined,
    },
  });

  useEffect(() => {
    if (eventId && eventId !== NEW_EVENT_ID) {
      form.setValue("id", eventId, { shouldValidate: true });
    }

    if (start) {
      form.setValue("start", start);
    }
    if (end) {
      form.setValue("end", end);
    }

    if (bookingId) {
      form.setValue("booking_id", bookingId, { shouldValidate: true });
    }

    if (description) {
      form.setValue("description", description);
    }

    if (start && end) {
      const startDate = parse(start, "HH:mm", new Date());
      const endDate = parse(end, "HH:mm", new Date());

      const durationInSeconds = differenceInSeconds(endDate, startDate);

      if (durationInSeconds) {
        form.setValue("duration", durationInSeconds, { shouldValidate: true });
      }
    }
  }, [start, end, bookingId, description, eventId]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onCreate)}
        className="mb-12 mt-6 space-y-4"
      >
        <TimeRangeInput
          value={{ start: form.watch("start"), end: form.watch("end") }}
          onChange={(value) => {
            form.setValue("start", value.start);
            form.setValue("end", value.end);
          }}
        />

        <FormField
          control={form.control}
          name="booking_id"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <TravelSelectBooking
                  onCreate={(booking) => {
                    if (booking) {
                      field.onChange(booking.id);
                      onSelectBooking(booking);
                    }
                  }}
                  teamId={teamId}
                  selectedId={field.value}
                  onSelect={(selected) => {
                    if (selected) {
                      field.onChange(selected.id);
                      onSelectBooking(selected);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assigned_id"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <AssignUser
                  selectedId={form.watch("assigned_id")}
                  onSelect={(assignedId: string) => {
                    if (assignedId) {
                      field.onChange(assignedId);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Description" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex mt-6 justify-between">
          <SubmitButton
            className="w-full"
            disabled={isSaving || !form.formState.isValid}
            isSubmitting={isSaving}
            type="submit"
          >
            {isUpdate ? "Update" : "Add"}
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
}
