import { getOffer, createOrder } from "@/lib/travel/duffel";
import type { CreateOrder } from "@duffel/api/booking/Orders/OrdersTypes";
import { DuffelError } from "@duffel/api";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get("id");

    if (!offerId) {
      return new Response(JSON.stringify({ error: "Offer ID is required" }), {
        status: 400,
      });
    }

    const offer = await getOffer(offerId);

    if (new Date(offer.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({
          error:
            "The selected offer has expired. Please search for new offers.",
        }),
        { status: 400 },
      );
    }

    return new Response(JSON.stringify(offer));
  } catch (error) {
    if (error instanceof DuffelError && error.meta) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.meta.status,
      });
    }

    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { userId }: { userId: string | null } = auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const orderParams = (await request.json()) as CreateOrder;

    orderParams.metadata = {
      ...orderParams.metadata,
      userId,
    };

    if (
      !orderParams.selected_offers ||
      !orderParams.passengers ||
      !orderParams.payments
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required booking information" }),
        { status: 400 },
      );
    }

    orderParams.passengers = orderParams.passengers.map((passenger) => ({
      ...passenger,
      phone_number: passenger.phone_number.startsWith("+")
        ? passenger.phone_number
        : `+${passenger.phone_number}`,
    }));

    const order = await createOrder(orderParams);

    if (!order.booking_reference) {
      throw new Error("Booking failed: No booking reference received");
    }

    return new Response(JSON.stringify(order));
  } catch (error) {
    if (error instanceof DuffelError && error.meta) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.meta.status,
      });
    }

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }),
      { status: 500 },
    );
  }
}
