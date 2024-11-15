import { render } from "@react-email/components";
import TransactionsEmail from "@travelese/email/emails/transactions";
import { getI18n } from "@travelese/email/locales";
import { getInboxEmail } from "@travelese/inbox";
import {
  NotificationTypes,
  TriggerEvents,
  triggerBulk,
} from "@travelese/notification";
import { logger, task } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { supabase } from "../client";
import { Jobs } from "../constants";

type NotificationPayload = z.infer<typeof schema>;

const schema = z.object({
  teamId: z.string(),
  transactions: z.array(
    z.object({
      id: z.string(),
      date: z.coerce.date(),
      amount: z.number(),
      name: z.string(),
      currency: z.string(),
      category: z.string().optional().nullable(),
      status: z.enum(["posted", "pending"]),
    }),
  ),
});

export const notification = task({
  id: Jobs.TRANSACTIONS_NOTIFICATION,
  run: async (payload: NotificationPayload) => {
    const { transactions, teamId } = payload;

    const sortedTransactions = transactions.sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );

    const { data: usersData } = await supabase
      .from("users_on_team")
      .select(
        "id, team_id, team:teams(inbox_id, name), user:users(id, full_name, avatar_url, email, locale)",
      )
      .eq("team_id", teamId);

    const notificationEvents = usersData?.map(({ user, team_id, team }) => {
      const { t } = getI18n({ locale: user.locale });

      // If single transaction
      if (sortedTransactions.length === 1) {
        const transaction = sortedTransactions?.at(0);

        if (transaction) {
          return {
            name: TriggerEvents.TransactionNewInApp,
            payload: {
              recordId: transaction.id,
              type: NotificationTypes.Transaction,
              description: t("notifications.transaction", {
                amount: Intl.NumberFormat(user.locale, {
                  style: "currency",
                  currency: transaction.currency,
                }).format(transaction.amount),
                from: transaction.name,
              }),
            },
            replyTo: getInboxEmail(team?.inbox_id),
            user: {
              subscriberId: user.id,
              teamId: team_id,
              email: user.email,
              fullName: user.full_name,
              avatarUrl: user.avatar_url,
            },
          };
        }
      }

      // If multiple transactions
      return {
        name: TriggerEvents.TransactionsNewInApp,
        payload: {
          type: NotificationTypes.Transactions,
          from: sortedTransactions.at(0)?.date,
          to: sortedTransactions[sortedTransactions.length - 1]?.date,
          description: t("notifications.transactions", {
            numberOfTransactions: sortedTransactions.length,
          }),
        },
        user: {
          subscriberId: user.id,
          teamId: team_id,
          email: user.email,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
        },
      };
    });

    if (notificationEvents?.length) {
      try {
        await triggerBulk(notificationEvents.flat());
      } catch (error) {
        logger.error("notification events", {
          error: error instanceof Error ? error.message : error,
        });
      }
    }

    const emailPromises = usersData?.map(async ({ user, team_id, team }) => {
      const { t } = getI18n({ locale: user.locale });

      const html = await render(
        TransactionsEmail({
          fullName: user.full_name,
          transactions: sortedTransactions,
          locale: user.locale,
          teamName: team?.name,
        }),
      );

      return {
        name: TriggerEvents.TransactionNewEmail,
        payload: {
          subject: t("transactions.subject"),
          html,
        },
        replyTo: getInboxEmail(team?.inbox_id),
        user: {
          subscriberId: user.id,
          teamId: team_id,
          email: user.email,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
        },
      };
    });

    const emailEvents = await Promise.all(emailPromises ?? []);

    if (emailEvents.length) {
      try {
        await triggerBulk(emailEvents);
      } catch (error) {
        logger.error("email events", {
          error: error instanceof Error ? error.message : error,
        });
      }
    }
  },
});
