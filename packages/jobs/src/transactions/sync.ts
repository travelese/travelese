import { logger, task } from "@trigger.dev/sdk/v3";
import { revalidateTag } from "next/cache";
import { supabase } from "../client";
import { Events, Jobs } from "../constants";
import { engine } from "../utils/engine";
import { parseAPIError } from "../utils/error";
import { getClassification, transformTransaction } from "../utils/transform";
import { scheduler } from "./scheduler";

type SyncPayload = {
  teamId: string;
};

export const sync = task({
  id: Jobs.TRANSACTIONS_SYNC,
  run: async (payload: SyncPayload) => {
    const { teamId } = payload;

    const { data: accountsData, error: accountsError } = await supabase
      .from("bank_accounts")
      .select(
        "id, team_id, account_id, type, bank_connection:bank_connection_id(id, provider, access_token)",
      )
      .eq("team_id", teamId)
      .eq("enabled", true)
      .eq("manual", false);

    if (accountsError) {
      await logger.error("Accounts Error", accountsError);
    }

    const promises = accountsData?.map(async (account) => {
      try {
        const balance = await engine.accounts.balance({
          provider: account.bank_connection.provider,
          id: account.account_id,
          accessToken: account.bank_connection?.access_token,
        });

        // Update account balance
        if (balance.data?.amount) {
          await supabase
            .from("bank_accounts")
            .update({ balance: balance.data.amount })
            .eq("id", account.id);
        }

        // Update bank connection last accessed
        // TODO: Fix so it only update once per connection
        await supabase
          .from("bank_connections")
          .update({ last_accessed: new Date().toISOString() })
          .eq("id", account.bank_connection.id);
      } catch (error) {
        if (error instanceof engine.APIError) {
          const parsedError = parseAPIError(error);

          await supabase
            .from("bank_connections")
            .update({
              status: parsedError.code,
              error_details: parsedError.message,
            })
            .eq("id", account.bank_connection.id);
        }
      }

      const transactions = await engine.transactions.list({
        provider: account.bank_connection.provider,
        accountId: account.account_id,
        accountType: getClassification(account.type),
        accessToken: account.bank_connection?.access_token,
        latest: "true",
      });

      const formattedTransactions = transactions.data?.map((transaction) => {
        return transformTransaction({
          transaction,
          teamId: account.team_id,
          bankAccountId: account.id,
        });
      });

      return formattedTransactions;
    });

    try {
      if (promises) {
        const result = await Promise.all(promises);
        const transactions = result.flat();

        if (!transactions?.length) {
          return null;
        }

        const { error: transactionsError, data: transactionsData } =
          await supabase
            .from("transactions")
            .upsert(transactions, {
              onConflict: "internal_id",
              ignoreDuplicates: true,
            })
            .select("*");

        if (transactionsError) {
          await logger.error("Transactions error", transactionsError);
        }

        if (transactionsData && transactionsData?.length > 0) {
          await io.sendEvent("🔔 Send notifications", {
            name: Events.TRANSACTIONS_NOTIFICATION,
            payload: {
              teamId,
              transactions: transactionsData.map((transaction) => ({
                id: transaction.id,
                date: transaction.date,
                amount: transaction.amount,
                name: transaction.name,
                currency: transaction.currency,
                category: transaction.category_slug,
                status: transaction.status,
              })),
            },
          });

          revalidateTag(`transactions_${teamId}`);
          revalidateTag(`spending_${teamId}`);
          revalidateTag(`metrics_${teamId}`);
          revalidateTag(`expenses_${teamId}`);
        }

        revalidateTag(`bank_accounts_${teamId}`);
      }
    } catch (error) {
      await logger.debug(`Team id: ${teamId}`);

      await logger.error(
        error instanceof Error ? error.message : String(error),
      );
    }
  },
});
