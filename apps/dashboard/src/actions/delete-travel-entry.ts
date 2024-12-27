"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const deleteTravelEntryAction = authActionClient
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .metadata({
    name: "delete-travel-entry",
  })
  .action(async ({ parsedInput: { id }, ctx: { supabase, user } }) => {
    const { data, error } = await supabase
      .from("travel_entries")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    revalidateTag(`travel_entries_${user.team_id}`);

    return data;
  });
