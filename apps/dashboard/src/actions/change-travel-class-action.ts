"use server";

import { authActionClient } from "@/actions/safe-action";
import { Cookies } from "@/utils/constants";
import { addYears } from "date-fns";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { changeTravelCabinSchema } from "./schema";

export const changeTravelCabinAction = authActionClient
  .schema(changeTravelCabinSchema)
  .metadata({
    name: "change-travel-cabin",
  })
  .action(async ({ parsedInput: value, ctx: { user } }) => {
    (await cookies()).set({
      name: Cookies.TravelCabin,
      value,
      expires: addYears(new Date(), 1),
    });

    revalidateTag(`travel_${user.id}`);

    return value;
  });
