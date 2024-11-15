import { tasks } from "@trigger.dev/sdk/v3";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300; // 5min

export async function POST(req: Request) {
  const payload = await req.json();

  const { publicAccessToken } = await tasks.trigger(payload.id, payload.data);

  return NextResponse.json({
    message: "OK",
    publicAccessToken,
  });
}
