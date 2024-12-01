"use server";

import { authActionClient } from "@/actions/safe-action";
import { updateEntriesSchema } from "@/actions/schema";
import { Cookies } from "@/utils/constants";
import { LogEvents } from "@travelese/events/events";
import { addYears } from "date-fns";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export const updateEntriesAction = authActionClient
  .schema(updateEntriesSchema)
  .metadata({
    name: "update-entries",
    track: {
      event: LogEvents.TravelCreateEntry.name,
      channel: LogEvents.TravelCreateEntry.channel,
    },
  })
  .action(async ({ parsedInput: params, ctx: { user, supabase } }) => {
    const { action, ...payload } = params;

    if (action === "delete") {
      await supabase.from("travel_entries").delete().eq("id", params.id);
      revalidateTag(`travel_bookings_${user.team_id}`);

      return Promise.resolve(params);
    }

    const { data: bookingData } = await supabase
      .from("travel_bookings")
      .select("id, rate, currency")
      .eq("id", params.booking_id)
      .single();

    const { error } = await supabase.from("travel_entries").upsert({
      ...payload,
      team_id: user.team_id,
      rate: bookingData?.rate,
      currency: bookingData?.currency,
    });

    if (error) {
      throw Error("Something went wrong.");
    }

    if (payload.booking_id) {
      (await cookies()).set({
        name: Cookies.LastBooking,
        value: payload.booking_id,
        expires: addYears(new Date(), 1),
      });
    }

    revalidateTag(`travel_bookings_${user.team_id}`);
    revalidateTag(`travel_entries_${user.team_id}`);

    return Promise.resolve(params);
  });
