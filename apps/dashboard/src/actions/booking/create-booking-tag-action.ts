"use server";

import { LogEvents } from "@travelese/events/events";
import { revalidateTag } from "next/cache";
import { authActionClient } from "../safe-action";
import { createBookingTagSchema } from "../schema";

export const createBookingTagAction = authActionClient
  .schema(createBookingTagSchema)
  .metadata({
    name: "create-booking-tag",
    track: {
      event: LogEvents.CreateBookingTag.name,
      channel: LogEvents.CreateBookingTag.channel,
    },
  })
  .action(
    async ({ parsedInput: { tagId, bookingId }, ctx: { user, supabase } }) => {
      const { data } = await supabase.from("travel_booking_tags").insert({
        tag_id: tagId,
        travel_booking_id: bookingId,
        team_id: user.team_id!,
      });

      revalidateTag(`travel_bookings_${user.team_id}`);

      return data;
    },
  );
