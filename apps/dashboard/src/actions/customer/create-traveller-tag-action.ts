"use server";

import { LogEvents } from "@travelese/events/events";
import { revalidateTag } from "next/cache";
import { authActionClient } from "../safe-action";
import { createTravellerTagSchema } from "./schema";

export const createTravellerTagAction = authActionClient
  .schema(createTravellerTagSchema)
  .metadata({
    name: "create-traveller-tag",
    track: {
      event: LogEvents.CreateTravellerTag.name,
      channel: LogEvents.CreateTravellerTag.channel,
    },
  })
  .action(
    async ({ parsedInput: { tagId, customerId }, ctx: { user, supabase } }) => {
      const { data } = await supabase.from("traveller_tags").insert({
        tag_id: tagId,
        traveller_id: travellerId,
        team_id: user.team_id!,
      });

      revalidateTag(`traveller_${user.team_id}`);

      return data;
    },
  );
