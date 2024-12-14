import { z } from "zod";

export const deleteTravellerTagSchema = z.object({
  tagId: z.string(),
  travellerId: z.string(),
});

export const createTravellerTagSchema = z.object({
  tagId: z.string(),
  travellerId: z.string(),
});
