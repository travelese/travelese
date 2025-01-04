"use server";

import { authActionClient } from "@/actions/safe-action";
import { Cookies } from "@/utils/constants";
import { addYears } from "date-fns";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { changeTravelModeSchema } from "../schema";

export const changeTravelModeAction = authActionClient
  .schema(changeTravelModeSchema)
  .metadata({
    name: "change-travel-type",
  })
  .action(async ({ parsedInput: value, ctx: { user } }) => {
    cookies().set({
      name: Cookies.TravelMode,
      value,
      expires: addYears(new Date(), 1),
    });

    revalidateTag(`travel_${user.id}`);

    return value;
  });
