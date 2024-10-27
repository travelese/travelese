"use server";

import { authActionClient } from "@/actions/safe-action";
import { deleteEntriesSchema } from "@/actions/schema";
import { LogEvents } from "@travelese/events/events";
import { revalidateTag } from "next/cache";

export const deleteEntriesAction = authActionClient
  .schema(deleteEntriesSchema)
  .metadata({
    name: "delete-entries",
    track: {
      event: LogEvents.TravelDeleteEntry.name,
      channel: LogEvents.TravelDeleteEntry.channel,
    },
  })
  .action(async ({ parsedInput: params, ctx: { user, supabase } }) => {
    await supabase.from("travel_entries").delete().eq("id", params.id);

    revalidateTag(`travel_bookings_${user.team_id}`);
    revalidateTag(`travel_entries_${user.team_id}`);
  });
