import { DocumentClient } from "@travelese/documents";
import {
  NotificationTypes,
  TriggerEvents,
  triggerBulk,
} from "@travelese/notification";
import { task } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { supabase } from "../client";
import { Jobs } from "../constants";
import { inboxMatch } from "./match";

type InboxDocumentPayload = z.infer<typeof schema>;

const schema = z.object({
  recordId: z.string(),
  teamId: z.string(),
});

export const inboxDocument = task({
  id: Jobs.INBOX_DOCUMENT,
  run: async (payload: InboxDocumentPayload) => {
    const { recordId, teamId } = payload;

    const { data: inboxData } = await supabase
      .from("inbox")
      .select()
      .eq("id", payload.recordId)
      .single()
      .throwOnError();

    // Get all users on team
    const { data: usersData } = await supabase
      .from("users_on_team")
      .select("team_id, user:users(id, full_name, avatar_url, email, locale)")
      .eq("team_id", payload.teamId);

    const { data } = await supabase.storage
      .from("vault")
      .download(inboxData.file_path.join("/"));

    // Convert the document data to a Buffer and base64 encode it.
    const buffer = await data?.arrayBuffer();

    if (!buffer) {
      throw Error("No file data");
    }

    try {
      const document = new DocumentClient({
        contentType: inboxData?.content_type,
      });

      const result = await document.getDocument({
        content: Buffer.from(buffer).toString("base64"),
      });

      const { data: updatedInbox } = await supabase
        .from("inbox")
        .update({
          amount: result.amount,
          currency: result.currency,
          display_name: result.name,
          website: result.website,
          date: result.date && new Date(result.date),
          type: result.type,
          description: result.description,
          status: "pending",
        })
        .eq("id", payload.recordId)
        .select()
        .single();

      if (updatedInbox?.amount) {
        await inboxMatch.trigger({
          teamId: updatedInbox.team_id,
          inboxId: updatedInbox.id,
          amount: updatedInbox.amount,
        });
      }
    } catch {
      // If we end up here we could not parse the document
      // But we want to update the status so we show the record with fallback name (Subject/From name)
      await supabase
        .from("inbox")
        .update({ status: "pending" })
        .eq("id", payload.recordId);

      if (!inboxData || !usersData?.length) {
        return;
      }

      // And send a notification about the new inbox record
      const notificationEvents = await Promise.all(
        usersData?.map(async ({ user, team_id }) => {
          return inboxData?.map((inbox) => ({
            name: TriggerEvents.InboxNewInApp,
            payload: {
              recordId: inbox.id,
              description: inbox.display_name,
              type: NotificationTypes.Inbox,
            },
            user: {
              subscriberId: user.id,
              teamId: team_id,
              email: user.email,
              fullName: user.full_name,
              avatarUrl: user.avatar_url,
            },
          }));
        }),
      );

      if (notificationEvents.length) {
        triggerBulk(notificationEvents?.flat());
      }
    }
  },
});
