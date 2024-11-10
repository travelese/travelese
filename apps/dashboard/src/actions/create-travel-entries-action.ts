"use server";

import { Cookies } from "@/utils/constants";
import { UTCDate } from "@date-fns/utc";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const createTravelEntriesAction = authActionClient
  .schema(
    z.object({
      id: z.string().optional(),
      start: z.string(),
      stop: z.string(),
      dates: z.array(z.string()),
      assigned_id: z.string(),
      booking_id: z.string(),
      description: z.string().optional(),
      duration: z.number(),
    }),
  )
  .metadata({
    name: "create-travel-entries",
  })
  .action(
    async ({ parsedInput: { dates, ...params }, ctx: { supabase, user } }) => {
      cookies().set(Cookies.LastBooking, params.booking_id);

      const entries = dates.map((date) => ({
        ...params,
        team_id: user.team_id,
        date: new UTCDate(date).toISOString(),
        start: new UTCDate(params.start).toISOString(),
        stop: new UTCDate(params.stop).toISOString(),
      }));

      const { data, error } = await supabase
        .from("travel_entries")
        .upsert(entries, {
          ignoreDuplicates: false,
        })
        .select(
          "*, assigned:assigned_id(id, full_name, avatar_url), booking:booking_id(id, name, rate, currency)",
        );

      if (error) {
        throw error;
      }

      revalidateTag(`travel_entries_${user.team_id}`);

      return data;
    },
  );
