"use server";

import { LogEvents } from "@travelese/events/events";
import { revalidateTag } from "next/cache";
import { authActionClient } from "../safe-action";
import { deleteBookingTagSchema } from "../schema";

export const deleteBookingTagAction = authActionClient
  .schema(deleteBookingTagSchema)
  .metadata({
    name: "delete-booking-tag",
    track: {
      event: LogEvents.DeleteBookingTag.name,
      channel: LogEvents.DeleteBookingTag.channel,
    },
  })
  .action(
    async ({ parsedInput: { tagId, bookingId }, ctx: { user, supabase } }) => {
      const { data } = await supabase
        .from("travel_booking_tags")
        .delete()
        .eq("travel_booking_id", bookingId)
        .eq("tag_id", tagId);

      revalidateTag(`travel_bookings_${user.team_id}`);

      return data;
    },
  );
