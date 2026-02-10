'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { stripe, STRIPE_PREMIUM_PRICE_ID } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';

const settingsUrl = absoluteUrl('/settings');

export async function createCheckoutSession() {
  const session = await auth();

  if (!session?.user || !session?.user?.email) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // If user already has a stripe customer ID, use it
  let customerId = user.stripeCustomerId;

  if (customerId) {
      // Check if already subscribed?
      // For now, Stripe checkout handles existing subscriptions if configured right, 
      // but usually we redirect to portal if they are already premium.
      if (user.isPremium) {
           return createCustomerPortal();
      }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.username,
      metadata: {
        userId: user.id,
      },
    });
    customerId = customer.id;
    
    await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: STRIPE_PREMIUM_PRICE_ID,
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
    },
    success_url: absoluteUrl('/settings?success=true'),
    cancel_url: absoluteUrl('/settings?canceled=true'),
  });

  if (!checkoutSession.url) {
     throw new Error("Failed to create checkout session");
  }

  redirect(checkoutSession.url);
}

export async function createCustomerPortal() {
  const session = await auth();

  if (!session?.user || !session?.user?.email) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.stripeCustomerId) {
    throw new Error('No subscription found');
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: settingsUrl,
  });

  redirect(portalSession.url);
}
