import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

let _stripe: Stripe | null = null;

/**
 * Get a singleton Stripe client for Edge Functions.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = Deno.env.get("STRIPE_SECRET_KEY");
    if (!key) throw new Error("STRIPE_SECRET_KEY not configured");

    _stripe = new Stripe(key, {
      apiVersion: "2024-04-10",
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return _stripe;
}

/**
 * Verify a Stripe webhook signature.
 */
export async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
