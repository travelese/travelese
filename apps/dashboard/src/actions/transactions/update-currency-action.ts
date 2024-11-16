"use server";

import { LogEvents } from "@travelese/events/events";
import { Jobs } from "@travelese/jobs";
import { updateTeam } from "@travelese/supabase/mutations";
import { auth, tasks } from "@trigger.dev/sdk/v3";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { authActionClient } from "../safe-action";

export const updateCurrencyAction = authActionClient
  .schema(
    z.object({
      baseCurrency: z.string(),
    }),
  )
  .metadata({
    name: "update-currency",
    track: {
      event: LogEvents.UpdateCurrency.name,
      channel: LogEvents.UpdateCurrency.channel,
    },
  })
  .action(
    async ({ parsedInput: { baseCurrency }, ctx: { user, supabase } }) => {
      await updateTeam(supabase, {
        id: user.team_id,
        base_currency: baseCurrency,
      });

      revalidateTag(`team_settings_${user.team_id}`);
      revalidatePath("/settings/accounts");

      const publicToken = await auth.createPublicToken({
        scopes: {
          read: {
            runs: true, // For testing - specify exact runs in production
          },
        },
      });

      const event = await tasks.trigger(Jobs.UPDATE_CURRENCY, {
        baseCurrency,
        teamId: user.team_id,
      });

      return {
        ...event,
        publicToken,
      };
    },
  );
