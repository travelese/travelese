"use server";

import { client } from "@travelese/kv";

export async function setViewCount(path: string) {
  return client.incr(`views-${path}`);
}
