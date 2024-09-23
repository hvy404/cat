"use server";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_DEV!, {
  apiVersion: "2024-06-20",
});

type CheckoutResult =
  | {
      url: string;
    }
  | {
      error: string;
    };

export async function createCheckoutSession(
  priceId: string
): Promise<CheckoutResult> {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_VERCEL_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_VERCEL_URL}/dashboard/canceled`,
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    return { url: session.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { error: "Failed to create checkout session" };
  }
}
