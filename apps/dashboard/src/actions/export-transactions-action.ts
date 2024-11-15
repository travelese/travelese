"use server";

import { LogEvents } from "@travelese/events/events";
import { Jobs } from "@travelese/jobs";
import { authActionClient } from "./safe-action";
import { exportTransactionsSchema } from "./schema";

export const exportTransactionsAction = authActionClient
  .schema(exportTransactionsSchema)
  .metadata({
    name: "export-transactions",
    track: {
      event: LogEvents.ExportTransactions.name,
      channel: LogEvents.ExportTransactions.channel,
    },
  })
  .action(async ({ parsedInput: transactionIds, ctx: { user } }) => {
    const event = await client.sendEvent({
      name: Jobs.TRANSACTIONS_EXPORT,
      payload: {
        transactionIds,
        teamId: user.team_id,
        locale: user.locale,
      },
    });

    return event;
  });
