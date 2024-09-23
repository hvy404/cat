import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
// TODO: Add clerk logic to grab user id

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_DEV!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  //console.log('Checkout session completed:', session);
  // Update user's subscription status in your database
  // Add your logic here
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  //console.log('Invoice payment succeeded:', invoice);
  // Update the user's subscription status or send a confirmation email
  // Add your logic here
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    default:
      //console.log(`Unhandled event type ${event.type}`);
  }
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    await handleEvent(event);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}