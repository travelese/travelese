"use server";

import { authActionClient } from "@/actions/safe-action";
import { createBookingSchema } from "@/actions/schema";
import { Cookies } from "@/utils/constants";
import { LogEvents } from "@travelese/events/events";
import { createBooking } from "@travelese/supabase/mutations";
import { addYears } from "date-fns";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export const createBookingAction = authActionClient
  .schema(createBookingSchema)
  .metadata({
    name: "create-booking",
    track: {
      event: LogEvents.BookingCreated.name,
      channel: LogEvents.BookingCreated.channel,
    },
  })
  .action(async ({ parsedInput: params, ctx: { user, supabase } }) => {
    const { data } = await createBooking(supabase, {
      ...params,
      team_id: user.team_id,
    });

    if (!data) {
      throw new Error("Failed to create booking");
    }

    (await cookies()).set({
      name: Cookies.LastBooking,
      value: data.id,
      expires: addYears(new Date(), 1),
    });

    revalidateTag(`travel_bookings_${user.team_id}`);

    return data;
  });
