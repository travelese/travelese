"use server";

import { LogEvents } from "@travelese/events/events";
import { generateToken } from "@travelese/invoice/token";
import { revalidateTag } from "next/cache";
import { authActionClient } from "./safe-action";
import { createTravellerSchema } from "./schema";

export const createTravellerAction = authActionClient
  .schema(createCustomerSchema)
  .metadata({
    name: "create-customer",
    track: {
      event: LogEvents.CreateTraveller.name,
      channel: LogEvents.CreateTraveller.channel,
    },
  })
  .action(async ({ parsedInput: input, ctx: { user, supabase } }) => {
    const token = await generateToken(user.id);

    const { data } = await supabase
      .from("travellers")
      .upsert(
        {
          ...input,
          token,
          team_id: user.team_id,
        },
        {
          onConflict: "id",
        },
      )
      .select("id, name")
      .single();

    revalidateTag(`travellers_${user.team_id}`);

    return data;
  });
