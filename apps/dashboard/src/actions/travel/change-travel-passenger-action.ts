"use server";

import { Cookies } from "@/utils/constants";
import { addYears } from "date-fns";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { authActionClient } from "../safe-action";
import { changeTravelPassengerSchema } from "./schema";

export const changeTravelPassengerAction = authActionClient
  .schema(changeTravelPassengerSchema)
  .metadata({
    name: "change-travel-passenger",
  })
  .action(async ({ parsedInput: value, ctx: { user } }) => {
    cookies().set({
      name: Cookies.TravelPassenger,
      value,
      expires: addYears(new Date(), 1),
    });

    revalidateTag(`travel_${user.id}`);

    return value;
  });
