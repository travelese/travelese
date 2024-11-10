"use server";

import { authActionClient } from "@/actions/safe-action";
import { createReportSchema } from "@/actions/schema";
import { dub } from "@/utils/dub";
import { LogEvents } from "@travelese/events/events";

export const createBookingReport = authActionClient
  .schema(createReportSchema)
  .metadata({
    name: "create-booking-report",
    track: {
      event: LogEvents.BookingReport.name,
      channel: LogEvents.BookingReport.channel,
    },
  })
  .action(async ({ parsedInput: params, ctx: { user, supabase } }) => {
    const { data } = await supabase
      .from("travel_reports")
      .insert({
        team_id: user.team_id,
        booking_id: params.bookingId,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (!data) {
      return;
    }

    const link = await dub.links.create({
      url: `${params.baseUrl}/report/booking/${data?.id}`,
    });

    const { data: linkData } = await supabase
      .from("travel_reports")
      .update({
        link_id: link.id,
        short_link: link.shortLink,
      })
      .eq("id", data.id)
      .select("*")
      .single();

    return linkData;
  });
