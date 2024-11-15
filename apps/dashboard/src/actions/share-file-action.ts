"use server";

import { dub } from "@/utils/dub";
import { LogEvents } from "@travelese/events/events";
import { share } from "@travelese/supabase/storage";
import { auth } from "@trigger.dev/sdk/v3";
import { authActionClient } from "./safe-action";
import { shareFileSchema } from "./schema";

export const shareFileAction = authActionClient
  .schema(shareFileSchema)
  .metadata({
    name: "share-file",
    track: {
      event: LogEvents.ShareFile.name,
      channel: LogEvents.ShareFile.channel,
    },
  })
  .action(async ({ parsedInput: value, ctx: { supabase, user } }) => {
    const response = await share(supabase, {
      bucket: "vault",
      path: `${user.team_id}/${value.filepath}`,
      expireIn: value.expireIn,
      options: {
        download: true,
      },
    });

    if (!response.data) {
      return null;
    }

    const link = await dub.links.create({
      url: response?.data?.signedUrl,
    });

    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: true, // For testing - specify exact runs in production
        },
      },
    });

    return {
      shortLink: link?.shortLink,
      publicToken,
    };
  });
