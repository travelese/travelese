"use server";

import { authActionClient } from "@/actions/safe-action";
import { Cookies } from "@/utils/constants";
import { addYears } from "date-fns";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { changeTravelLocationSchema } from "./schema";

export const changeTravelLocationAction = authActionClient
  .schema(changeTravelLocationSchema)
  .metadata({
    name: "change-travel-location",
  })
  .action(async ({ parsedInput: { type, value }, ctx: { user } }) => {
    const cookieName =
      type === "origin" ? Cookies.TravelOrigin : Cookies.TravelDestination;

    cookies().set({
      name: cookieName,
      value,
      expires: addYears(new Date(), 1),
    });

    revalidateTag(`travel_${user.id}`);

    return { type, value };
  });
