"use server";

import { authActionClient } from "@/actions/safe-action";
import { revalidateTag } from "next/cache";
import { changeTravelPeriodSchema } from "./schema";

export const changeTravelPeriodAction = authActionClient
  .schema(changeTravelPeriodSchema)
  .metadata({
    name: "change-travel-period",
  })
  .action(async ({ parsedInput: value, ctx: { user } }) => {
    revalidateTag(`travel_${user.id}`);

    return value;
  });
