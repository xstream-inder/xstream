import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY environment variable is required in production');
}

export const stripe = new Stripe(STRIPE_SECRET_KEY || 'null', {
  apiVersion: '2026-01-28.clover',
  typescript: true,
});

const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;
if (!premiumPriceId && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_PREMIUM_PRICE_ID environment variable is  required in production');
}

export const STRIPE_PREMIUM_PRICE_ID = premiumPriceId || ''; 
