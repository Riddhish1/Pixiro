

import { changeAttendanceType } from "@/action/attendance";
 
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Configure relevant Stripe events
const STRIPE_SUBSCRIPTION_EVENTS = new Set([
  "invoice.created",
  "invoice.finalized",
  "invoice.paid",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: NextRequest) {
  console.log("Received Stripe webhook event");
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  try {
    const stripeEvent = await getStripeEvent(body, signature);

    // Process only relevant subscription events
    if (!STRIPE_SUBSCRIPTION_EVENTS.has(stripeEvent.type)) {
      console.log("👉🏻 Unhandled irrelevant event!", stripeEvent.type);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const event = stripeEvent.data.object as Stripe.Subscription;
    const metadata = event.metadata;

    // Skip connected account events
    if (
      metadata.connectAccountPayments ||
      metadata.connectAccountSubscriptions
    ) {
      console.log("Skipping connected account subscription event");
      return NextResponse.json(
        { message: "Skipping connected account event" },
        { status: 200 }
      );
    }

    switch (stripeEvent.type) {
      case "checkout.session.completed":
      await changeAttendanceType(event?.metadata?.attendeeId, event?.metadata?.webinarId, "CONVERTED"); 
      case "customer.subscription.created":
      case "customer.subscription.updated":
       
        console.log("CREATED FROM WEBHOOK 💳", event);
        return NextResponse.json({ received: true }, { status: 200 });
      default:
        console.log("👉🏻 Unhandled relevant event!", stripeEvent.type);
        return NextResponse.json({ received: true }, { status: 200 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return new NextResponse(`Webhook Error: ${error.message}`, {
      status: error.statusCode || 500,
    });
  }
}

// Helper functions
const getStripeEvent = async (
  body: string,
  sig: string | null
): Promise<Stripe.Event> => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    throw new Error("Stripe signature or webhook secret missing");
  }

  return stripe.webhooks.constructEvent(body, sig, webhookSecret);
};
