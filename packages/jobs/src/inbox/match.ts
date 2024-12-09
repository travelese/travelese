import { getI18n } from "@travelese/email/locales";
import {
  NotificationTypes,
  TriggerEvents,
  triggerBulk,
} from "@travelese/notification";
import { updateInboxById } from "@travelese/supabase/mutations";
import { task } from "@trigger.dev/sdk/v3";
import { subDays } from "date-fns";
import { revalidateTag } from "next/cache";
import { supabase } from "../client";
import { Jobs } from "../constants";

interface InboxMatchPayload {
  inboxId: string;
  amount: number;
  teamId: string;
}

export const inboxMatch = task({
  id: Jobs.INBOX_MATCH,
  run: async (payload: InboxMatchPayload) => {
    // NOTE: All inbox reciepts and invoices amount are
    // saved with positive values while transactions have signed values
    const { data: transactionData } = await supabase
      .from("transactions")
      .select("id, name, team_id, attachments:transaction_attachments(*)")
      .eq("amount", -Math.abs(payload.amount))
      .eq("team_id", payload.teamId)
      .filter("transaction_attachments.id", "is", null)
      .gte("created_at", subDays(new Date(), 45).toISOString());

    // NOTE: If we match more than one transaction record we can't be sure of a match
    if (transactionData?.length === 1) {
      const transaction = transactionData.at(0);

      const { data: inboxData } = await supabase
        .from("inbox")
        .select("*")
        .eq("team_id", payload.teamId)
        .eq("id", payload.inboxId)
        .single();

      const { data: attachmentData } = await supabase
        .from("transaction_attachments")
        .insert({
          type: inboxData.content_type,
          path: inboxData.file_path,
          transaction_id: transaction?.id,
          team_id: inboxData.team_id,
          size: inboxData.size,
          name: inboxData.file_name,
        })
        .select()
        .single();

      const { data: updatedInboxData } = await updateInboxById(supabase, {
        id: inboxData.id,
        attachment_id: attachmentData.id,
        transaction_id: transaction?.id,
        teamId: payload.teamId,
      });

      if (!updatedInboxData) {
        throw Error("Nothing updated");
      }

      revalidateTag(`transactions_${inboxData.team_id}`);

      const { data: usersData } = await supabase
        .from("users_on_team")
        .select(
          "id, team_id, user:users(id, full_name, avatar_url, email, locale, team_id)",
        )
        .eq("team_id", inboxData.team_id);

      const notificationEvents = usersData?.map(({ user }) => {
        const { t } = getI18n({ locale: user?.locale });

        return {
          name: TriggerEvents.MatchNewInApp,
          payload: {
            recordId: updatedInboxData.transaction_id,
            description: t("notifications.match", {
              transactionName: transaction?.name,
              fileName: updatedInboxData.file_name,
            }),
            type: NotificationTypes.Match,
          },
          user: {
            subscriberId: user.id,
            teamId: user.team_id,
            email: user.email,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
          },
        };
      });

      if (notificationEvents?.length) {
        triggerBulk(notificationEvents?.flat());
      }

      return updatedInboxData;
    }
  },
});
