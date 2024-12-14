"use server";

import { LogEvents } from "@travelese/events/events";
import { revalidateTag } from "next/cache";
import { authActionClient } from "../safe-action";
import { deleteTravellerTagSchema } from "./schema";

export const deleteTravellerTagAction = authActionClient
  .schema(deleteTravellerTagSchema)
  .metadata({
    name: "delete-traveller-tag",
    track: {
      event: LogEvents.DeleteTravellerTag.name,
      channel: LogEvents.DeleteTravellerTag.channel,
    },
  })
  .action(
    async ({
      parsedInput: { tagId, travellerId },
      ctx: { user, supabase },
    }) => {
      const { data } = await supabase
        .from("traveller_tags")
        .delete()
        .eq("traveller_id", travellerId)
        .eq("tag_id", tagId);

      revalidateTag(`traveller_${user.team_id}`);

      return data;
    },
  );
