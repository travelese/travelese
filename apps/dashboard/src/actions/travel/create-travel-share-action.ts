"use server";

import { authActionClient } from "@/actions/safe-action";
import { createTravelShareSchema } from "@/actions/travel/schema";
import { dub } from "@/utils/dub";
import { LogEvents } from "@travelese/events/events";

export const createTravelShareAction = authActionClient
  .schema(createTravelShareSchema)
  .metadata({
    name: "create-travel-share",
    track: {
      event: LogEvents.TravelShare.name,
      channel: LogEvents.TravelShare.channel,
    },
  })
  .action(async ({ parsedInput: params, ctx: { user, supabase } }) => {
    const { data } = await supabase
      .from("travel_shares")
      .insert({
        user_id: user.id,
        from: params.from,
        to: params.to,
        type: params.type,
        expire_at: params.expiresAt,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (!data) {
      return null;
    }

    const link = await dub.links.create({
      url: `${params.baseUrl}/travel/${data.id}`,
      expiresAt: params.expiresAt,
    });

    const { data: linkData } = await supabase
      .from("travel_shares")
      .update({
        link_id: link.id,
        short_link: link.shortLink,
      })
      .eq("id", data.id)
      .select("*")
      .single();

    return linkData;
  });
