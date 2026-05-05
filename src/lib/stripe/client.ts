import "server-only";

import Stripe from "stripe";

let cached: Stripe | undefined;

export function getStripeClient(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  cached = new Stripe(key, { apiVersion: "2025-08-27.basil" });
  return cached;
}

export function getStripeWebhookSecret(): string {
  const value = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!value) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }
  return value;
}
