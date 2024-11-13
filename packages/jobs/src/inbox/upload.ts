import { DocumentClient } from "@travelese/documents";
import { logger, task } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { supabase } from "../client";
import { Events, Jobs } from "../constants";

type InboxUploadPayload = z.infer<typeof schema>;

const schema = z.object({
  record: z.object({
    path_tokens: z.array(z.string()),
    metadata: z.object({
      mimetype: z.string(),
      size: z.number(),
    }),
    id: z.string(),
    bucket_id: z.literal("vault"),
  }),
});

export const inboxUpload = task({
  id: Jobs.INBOX_UPLOAD,
  run: async (payload: InboxUploadPayload) => {
    const { path_tokens, metadata, id } = payload.record;
    const teamId = path_tokens.at(0);
    const filename = path_tokens.at(-1);

    const { data: inboxData } = await supabase
      .from("inbox")
      .insert({
        // NOTE: If we can't parse the name using OCR this will be the fallback name
        display_name: filename,
        team_id: teamId,
        file_path: path_tokens,
        file_name: filename,
        content_type: metadata.mimetype,
        reference_id: `${id}_${filename}`,
        size: metadata.size,
      })
      .select("*")
      .single()
      .throwOnError();

    const { data } = await supabase.storage
      .from("vault")
      .download(path_tokens.join("/"));

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
        .eq("id", inboxData.id)
        .select()
        .single();

      if (updatedInbox?.amount) {
        await io.sendEvent("Match Inbox", {
          name: Events.INBOX_MATCH,
          payload: {
            teamId: updatedInbox.team_id,
            inboxId: updatedInbox.id,
            amount: updatedInbox.amount,
          },
        });
      }
    } catch {
      // If we end up here we could not parse the document
      // But we want to update the status so we show the record with fallback name
      await supabase
        .from("inbox")
        .update({ status: "pending" })
        .eq("id", inboxData.id);
    }
  },
});
