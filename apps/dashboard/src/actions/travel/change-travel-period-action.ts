"use server";

import { revalidateTag } from "next/cache";
import { authActionClient } from "../safe-action";
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
