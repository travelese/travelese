"use server";

import { authActionClient } from "@/actions/safe-action";
import { manualSyncTransactionsSchema } from "@/actions/schema";
import { LogEvents } from "@travelese/events/events";
import { Jobs } from "@travelese/jobs";
import { auth, tasks } from "@trigger.dev/sdk/v3";

export const manualSyncTransactionsAction = authActionClient
  .schema(manualSyncTransactionsSchema)
  .metadata({
    name: "manual-sync-transactions",
    track: {
      event: LogEvents.TransactionsManualSync.name,
      channel: LogEvents.TransactionsManualSync.channel,
    },
  })
  .action(async ({ parsedInput: { connectionId }, ctx: { user } }) => {
    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: true, // For testing - specify exact runs in production
        },
      },
    });

    const event = await tasks.trigger(Jobs.TRANSACTIONS_MANUAL_SYNC, {
      connectionId,
      teamId: user.team_id,
    });

    return {
      ...event,
      publicToken,
    };
  });
