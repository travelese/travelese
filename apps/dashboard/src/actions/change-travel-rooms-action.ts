"use server";

import { authActionClient } from "@/actions/safe-action";
import { Cookies } from "@/utils/constants";
import { addYears } from "date-fns";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

export const changeTravelRoomsAction = authActionClient
  .schema(z.number().min(1).max(10))
  .metadata({
    name: "change-travel-rooms",
  })
  .action(async ({ parsedInput: value, ctx: { user } }) => {
    cookies().set({
      name: Cookies.TravelRooms,
      value: value.toString(),
      expires: addYears(new Date(), 1),
    });

    revalidateTag(`travel_${user.id}`);

    return value;
  });
