"use server";

import { authActionClient } from "@/actions/safe-action";
import { deleteBookingSchema } from "@/actions/schema";
import { LogEvents } from "@travelese/events/events";
import { revalidateTag } from "next/cache";

export const deleteBookingAction = authActionClient
  .schema(deleteBookingSchema)
  .metadata({
    name: "delete-booking",
    track: {
      event: LogEvents.BookingDeleted.name,
      channel: LogEvents.BookingDeleted.channel,
    },
  })
  .action(async ({ parsedInput: params, ctx: { user, supabase } }) => {
    await supabase.from("travel_bookings").delete().eq("id", params.id);

    revalidateTag(`travel_bookings_${user.team_id}`);
  });
