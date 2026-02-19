import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // --- New checkout completed ---
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session?.metadata?.userId) {
          return new NextResponse('User id is required', { status: 400 });
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        await prisma.user.update({
          where: { id: session.metadata.userId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.items.data[0].current_period_end * 1000
            ),
            isPremium: true,
          },
        });
        break;
      }

      // --- Renewal payment succeeded ---
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        // Only process subscription invoices (not one-time payments)
        const subId = invoice.parent?.subscription_details?.subscription;
        if (!subId) break;

        const subscription = await stripe.subscriptions.retrieve(
          typeof subId === 'string' ? subId : subId.id
        );

        await prisma.user.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.items.data[0].current_period_end * 1000
            ),
            isPremium: true,
          },
        });
        break;
      }

      // --- Payment failed (e.g., card declined on renewal) ---
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        const failedSubId = invoice.parent?.subscription_details?.subscription;
        if (!failedSubId) break;

        const failedSubIdStr = typeof failedSubId === 'string' ? failedSubId : failedSubId.id;

        // After multiple failed attempts, Stripe will cancel the subscription
        // and fire `customer.subscription.deleted`. Here we just log it.
        // Optionally: send a notification email to the user.
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: failedSubIdStr },
          select: { id: true, email: true, username: true },
        });

        if (user) {
          console.warn(
            `\u26A0\uFE0F Payment failed for user ${user.username} (${user.email}), subscription: ${failedSubIdStr}`
          );
          // TODO: Send "update your payment method" email via Resend
        }
        break;
      }

      // --- Plan changed (upgrade/downgrade) ---
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        const isActive = ['active', 'trialing'].includes(subscription.status);

        await prisma.user.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.items.data[0].current_period_end * 1000
            ),
            isPremium: isActive,
          },
        });
        break;
      }

      // --- Subscription cancelled/expired ---
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.user.update({
          where: { stripeSubscriptionId: subscription.id },
          data: { isPremium: false },
        });
        break;
      }

      default:
        // Unhandled event type — log and acknowledge
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing Stripe event ${event.type}:`, error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
