"use server";

import { authActionClient } from "@/actions/safe-action";
import { updateBookingSchema } from "@/actions/schema";
import { LogEvents } from "@travelese/events/events";
import { revalidateTag } from "next/cache";

export const updateBookingAction = authActionClient
  .schema(updateBookingSchema)
  .metadata({
    name: "update-booking",
    track: {
      event: LogEvents.BookingUpdated.name,
      channel: LogEvents.BookingUpdated.channel,
    },
  })
  .action(async ({ parsedInput: params, ctx: { user, supabase } }) => {
    const { id, ...data } = params;

    await supabase.from("travel_bookings").update(data).eq("id", id);

    revalidateTag(`travel_bookings_${user.team_id}`);
  });
