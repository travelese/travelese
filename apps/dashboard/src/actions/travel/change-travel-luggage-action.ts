"use server";

import { Cookies } from "@/utils/constants";
import { addYears } from "date-fns";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { authActionClient } from "../safe-action";
import { changeTravelLuggageSchema } from "./schema";

export const changeTravelLuggageAction = authActionClient
  .schema(changeTravelLuggageSchema)
  .metadata({
    name: "change-travel-luggage",
  })
  .action(async ({ parsedInput: value, ctx: { user } }) => {
    cookies().set({
      name: Cookies.TravelLuggage,
      value,
      expires: addYears(new Date(), 1),
    });

    revalidateTag(`travel_${user.id}`);

    return value;
  });
