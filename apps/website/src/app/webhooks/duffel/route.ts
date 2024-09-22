import crypto from "crypto";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema/orders";
import { travellers } from "@/lib/db/schema/travellers";
import { segments } from "@/lib/db/schema/segments";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env.mjs";

export async function POST(request: Request) {
  console.log("Received webhook request");
  console.log("Headers:", Object.fromEntries(request.headers));

  const WEBHOOK_SECRET = env.DUFFEL_WEBHOOK_SECRET!;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add DUFFEL_WEBHOOK_SECRET from Duffel Dashboard to .env",
    );
  }

  const signature = request.headers.get("x-duffel-signature");
  if (!signature) {
    console.log("No x-duffel-signature header found");
    return Response.json(
      { error: "No x-duffel-signature header" },
      { status: 400 },
    );
  }

  console.log("Webhook event ID:", request.headers.get("x-duffel-event"));
  console.log("Webhook delivery ID:", request.headers.get("x-duffel-delivery"));

  const payload = await request.text();
  console.log("Received payload:", payload);

  const [t, v1] = signature.split(",");
  const timestamp = t.split("=")[1];

  const signedPayload = `${timestamp}.${payload}`;
  const computedSignature = `v1=${crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex")}`;

  console.log("Received signature:", v1);
  console.log("Computed signature:", computedSignature);

  if (computedSignature !== v1) {
    console.log("Signature verification failed");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  console.log("Signature verification successful");

  // Parse the payload
  const event = JSON.parse(payload);
  console.log("Event type:", event.type);

  // Handle the webhook
  try {
    switch (event.type) {
      case "order.created":
      case "order.updated":
        console.log("Handling order created/updated event");
        await handleOrderCreatedOrUpdated(event.data);
        break;
      case "order.cancelled":
        console.log("Handling order cancelled event");
        await handleOrderCancelled(event.data.id);
        break;
      case "ping":
        console.log("Received ping event");
        console.log("Ping payload:", JSON.stringify(event, null, 2));
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing event type ${event.type}:`, error);
    return Response.json(
      { error: "Error processing webhook" },
      { status: 500 },
    );
  }

  console.log("Webhook processed successfully");
  return Response.json({ received: true }, { status: 200 });
}

async function handleOrderCreatedOrUpdated(orderData: any) {
  await db.transaction(async (trx) => {
    const orderValues = {
      id: orderData.id,
      userId: orderData.metadata?.userId,
      bookingReference: orderData.booking_reference,
      totalAmount: orderData.total_amount,
      currency: orderData.total_currency,
      passengerName: `${orderData.passengers[0].given_name} ${orderData.passengers[0].family_name}`,
      passengerEmail: orderData.passengers[0].email,
      taxAmount: orderData.tax_amount || "0",
      paymentStatus: orderData.payment_status.awaiting_payment
        ? "Awaiting Payment"
        : "Paid",
      isLive: orderData.live_mode,
      syncedAt: new Date(),
    };

    await trx.insert(orders).values(orderValues).onConflictDoUpdate({
      target: orders.id,
      set: orderValues,
    });

    for (const passenger of orderData.passengers) {
      const travellerValues = {
        id: passenger.id,
        userId: orderData.metadata?.userId,
        orderId: orderData.id,
        givenName: passenger.given_name,
        familyName: passenger.family_name,
        email: passenger.email || "",
        phoneNumber: passenger.phone_number || "",
        bornOn: passenger.born_on ? new Date(passenger.born_on) : new Date(0),
        gender: passenger.gender || "",
        loyaltyProgramme:
          passenger.loyalty_programme_accounts?.[0]?.account_number || null,
      };

      await trx.insert(travellers).values(travellerValues).onConflictDoUpdate({
        target: travellers.id,
        set: travellerValues,
      });
    }

    for (const slice of orderData.slices) {
      for (const segment of slice.segments) {
        const segmentValues = {
          id: segment.id,
          orderId: orderData.id,
          aircraft: segment.aircraft,
          arrivingAt: new Date(segment.arriving_at),
          departingAt: new Date(segment.departing_at),
          destination: segment.destination,
          destinationTerminal: segment.destination_terminal ?? null,
          duration: segment.duration ?? null,
          marketingCarrier: segment.marketing_carrier,
          marketingCarrierFlightNumber: segment.marketing_carrier_flight_number,
          operatingCarrier: segment.operating_carrier,
          operatingCarrierFlightNumber: segment.operating_carrier_flight_number,
          origin: segment.origin,
          originTerminal: segment.origin_terminal ?? null,
          passengers: segment.passengers,
          distance: segment.distance ?? null,
        };

        await trx.insert(segments).values(segmentValues).onConflictDoUpdate({
          target: segments.id,
          set: segmentValues,
        });
      }
    }
  });
}

async function handleOrderCancelled(orderId: string) {
  await db
    .update(orders)
    .set({ paymentStatus: "Cancelled" })
    .where(eq(orders.id, orderId));
}
