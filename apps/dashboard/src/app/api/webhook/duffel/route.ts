import crypto from "node:crypto";
import { env } from "@/env.mjs";

export async function POST(request: Request) {
  const DUFFEL_WEBHOOK_SECRET = env.DUFFEL_TRAVELESE_PRO_WEBHOOK_SECRET!;

  if (!DUFFEL_WEBHOOK_SECRET) {
    throw new Error(
      "Please add DUFFEL_WEBHOOK_SECRET from Duffel Dashboard to .env",
    );
  }

  const signature = request.headers.get("x-duffel-signature");
  if (!signature) {
    return Response.json(
      { error: "No x-duffel-signature header" },
      { status: 400 },
    );
  }

  const payload = await request.text();

  const [t, v1] = signature.split(",");
  const timestamp = t.split("=")[1];

  const signedPayload = `${timestamp}.${payload}`;
  const computedSignature = `v1=${crypto
    .createHmac("sha256", DUFFEL_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex")}`;

  if (computedSignature !== v1) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }
  // Parse the payload
  const event = JSON.parse(payload);

  // Handle the webhook
  try {
    switch (event.type) {
      case "order.created":
      case "order.updated":
        break;
      case "order.cancelled":
        break;
      case "ping":
        break;
      default:
    }
  } catch (error) {
    return Response.json(
      { error: "Error processing webhook" },
      { status: 500 },
    );
  }

  return Response.json({ received: true }, { status: 200 });
}
