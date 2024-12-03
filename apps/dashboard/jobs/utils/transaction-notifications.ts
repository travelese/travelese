import { render } from "@react-email/components";
import { sendSlackTransactionNotifications } from "@travelese/app-store/slack-notifications";
import TransactionsEmail from "@travelese/email/emails/transactions";
import { getI18n } from "@travelese/email/locales";
import { getInboxEmail } from "@travelese/inbox";
import {
  NotificationTypes,
  TriggerEvents,
  triggerBulk,
} from "@travelese/notification";
import { createClient } from "@travelese/supabase/job";
import { logger } from "@trigger.dev/sdk/v3";

interface User {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
  locale: string;
}

interface Team {
  inbox_id: string;
  name: string;
}

interface UserData {
  user: User;
  team_id: string;
  team: Team;
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  name: string;
  currency: string;
  category: string;
  status: string;
}

export async function handleTransactionNotifications(
  usersData: UserData[],
  transactions: Transaction[],
) {
  const notificationEvents = usersData.map(({ user, team_id }) => {
    const { t } = getI18n({ locale: user.locale ?? "en" });

    return {
      name: TriggerEvents.TransactionsNewInApp,
      payload: {
        type: NotificationTypes.Transactions,
        from: transactions[0]?.date,
        to: transactions[transactions.length - 1]?.date,
        description: t("notifications.transactions", {
          numberOfTransactions: transactions.length,
          // For single transaction
          amount: transactions[0]?.amount,
          name: transactions[0]?.name,
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

  const validNotificationEvents = notificationEvents.filter(Boolean);

  try {
    await triggerBulk(validNotificationEvents);
  } catch (error) {
    await logger.error("Transaction notifications", { error });
  }

  return validNotificationEvents;
}

export async function handleTransactionEmails(
  usersData: UserData[],
  transactions: Transaction[],
) {
  const emailPromises = usersData.map(async ({ user, team_id, team }) => {
    const { t } = getI18n({ locale: user.locale ?? "en" });

    const html = await render(
      TransactionsEmail({
        fullName: user.full_name,
        transactions,
        locale: user.locale ?? "en",
        teamName: team.name,
      }),
    );

    return {
      name: TriggerEvents.TransactionNewEmail,
      payload: {
        subject: t("transactions.subject"),
        html,
      },
      replyTo: getInboxEmail(team.inbox_id),
      user: {
        subscriberId: user.id,
        teamId: team_id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
      },
    };
  });

  const validEmailPromises = await Promise.all(emailPromises);

  try {
    await triggerBulk(validEmailPromises);
  } catch (error) {
    await logger.error("Transaction emails", { error });
  }

  return validEmailPromises;
}

export async function handleTransactionSlackNotifications(
  teamId: string,
  transactions: Transaction[],
) {
  const supabase = createClient();

  // TODO: Get correct locale for formatting the amount
  const slackTransactions = transactions.map((transaction) => ({
    amount: Intl.NumberFormat("en-US", {
      style: "currency",
      currency: transaction.currency,
    }).format(transaction.amount),
    name: transaction.name,
  }));

  await sendSlackTransactionNotifications({
    teamId,
    transactions: slackTransactions,
    supabase,
  });
}
