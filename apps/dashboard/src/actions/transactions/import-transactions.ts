"use server";

import { LogEvents } from "@travelese/events/events";
import { formatAmountValue } from "@travelese/import";
import { Jobs } from "@travelese/jobs";
import { getTimezone } from "@travelese/location";
import { auth, tasks } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { authActionClient } from "../safe-action";

export const importTransactionsAction = authActionClient
  .schema(
    z.object({
      filePath: z.array(z.string()).optional(),
      bankAccountId: z.string(),
      currency: z.string(),
      currentBalance: z.string().optional(),
      inverted: z.boolean(),
      dateAdjustment: z.number().optional(),
      table: z.array(z.record(z.string(), z.string())).optional(),
      importType: z.enum(["csv", "image"]),
      mappings: z.object({
        amount: z.string(),
        date: z.string(),
        description: z.string(),
        balance: z.string().optional(),
      }),
    }),
  )
  .metadata({
    name: "import-transactions",
    track: {
      event: LogEvents.ImportTransactions.name,
      channel: LogEvents.ImportTransactions.channel,
    },
  })
  .action(
    async ({
      parsedInput: {
        filePath,
        bankAccountId,
        currency,
        mappings,
        currentBalance,
        inverted,
        dateAdjustment,
        table,
        importType,
      },
      ctx: { user, supabase },
    }) => {
      // Generate public token for this specific run
      const publicToken = await auth.createPublicToken({
        scopes: {
          read: {
            runs: true, // For testing only - in production specify exact runs
          },
        },
      });

      console.log("Public Token:", publicToken); // Log the token

      // Update currency for account
      const balance = currentBalance
        ? formatAmountValue({ amount: currentBalance })
        : null;

      await supabase
        .from("bank_accounts")
        .update({ currency, balance })
        .eq("id", bankAccountId);

      const timezone = getTimezone();

      const event = await tasks.trigger(Jobs.TRANSACTIONS_IMPORT, {
        filePath,
        bankAccountId,
        currency,
        mappings,
        teamId: user.team_id,
        inverted,
        dateAdjustment,
        importType,
        table,
        timezone,
      });

      return {
        ...event,
        publicToken, // Return token with event data
      };
    },
  );
