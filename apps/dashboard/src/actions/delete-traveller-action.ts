"use server";

import { LogEvents } from "@travelese/events/events";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const deleteTravellerAction = authActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .metadata({
    name: "delete-traveller",
    track: {
      event: LogEvents.DeleteTraveller.name,
      channel: LogEvents.DeleteTraveller.channel,
    },
  })
  .action(async ({ parsedInput: input, ctx: { user, supabase } }) => {
    const { data } = await supabase
      .from("travellers")
      .delete()
      .eq("id", input.id)
      .select("id");

    revalidateTag(`travellers_${user.team_id}`);
    revalidateTag(`invoices_${user.team_id}`);

    return data;
  });
