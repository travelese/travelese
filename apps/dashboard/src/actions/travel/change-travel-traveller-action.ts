"use server";

import { authActionClient } from "@/actions/safe-action";
import { Cookies } from "@/utils/constants";
import { addYears } from "date-fns";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { changeTravelTravellerSchema } from "../schema";

export const changeTravelTravellerAction = authActionClient
  .schema(changeTravelTravellerSchema)
  .metadata({
    name: "change-travel-traveller",
  })
  .action(async ({ parsedInput: value, ctx: { user } }) => {
    cookies().set({
      name: Cookies.TravelTraveller,
      value,
      expires: addYears(new Date(), 1),
    });

    revalidateTag(`travel_${user.id}`);

    return value;
  });
