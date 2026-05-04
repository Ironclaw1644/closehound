# CloseHound Env Setup

CloseHound is the **internal** operator console. WalkPerro is the **customer-facing** brand
that shows up in outbound emails, the preview footer, and the buy flow.

## Quick start

```bash
# 1. Sync the Supabase / public env vars into .env.local + Vercel.
bash scripts/setup-env.sh

# 2. Apply the V1 migration (lead_score, purchases, etc.).
supabase db push

# 3. Create the Storage bucket for generated logos and hero images.
#    From the Supabase dashboard: Storage → New bucket → name: preview-assets, Public.

# 4. Run Next dev for the operator console.
npm run dev

# 5. In a second terminal, run the worker (Mac mini friendly).
npm run worker
```

You can also alias `worker` in your shell so typing `worker` in the project dir starts polling:

```bash
echo 'alias worker="npm run worker"' >> ~/.zshrc
```

## Required env vars

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` *(server-only — never expose)*

### Public site URLs
- `NEXT_PUBLIC_SITE` — internal app origin, e.g. `https://closehound.com`
- `PREVIEW_SITE` — customer-facing preview origin, e.g. `https://walkperro.com`

### Branding
- `NEXT_PUBLIC_APP_NAME=CloseHound`
- `NEXT_PUBLIC_APP_BRAND=CloseHound`
- `FULFILLMENT_BRAND_NAME=WalkPerro`
- `OUTBOUND_SENDER_NAME=WalkPerro`
- `OUTBOUND_SENDER_FIRST_NAME` — your first name; signs outbound emails.
- `OUTBOUND_SENDER_PHONE` — your cell number; lands in the email signature.

### Outbound email (Resend)
- `RESEND_API_KEY`
- `RESEND_FROM` — verified sender, e.g. `casey@walkperro.com`
- `OUTBOUND_TEST_RECIPIENT` *(optional)* — used when a lead has no `contact_email`.
- `NOTIFY_PURCHASES_TO` *(optional)* — internal address that gets a `[CloseHound] sale` email after a Stripe checkout.

### LeadHound
- `GOOGLE_PLACES_API_KEY` — Places API (New) key.
- `OLLAMA_BASE_URL` *(default `http://localhost:11434`)*
- `OLLAMA_MODEL` *(default `qwen2.5:latest`)*

### Image generation (Gemini Nano Banana 2)
- `GEMINI_API_KEY` *or* `GOOGLE_API_KEY`
- `GEMINI_IMAGE_MODEL` *(default `gemini-2.5-flash-image`)*

### Stripe
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_BUY_LINK_BASE` *(optional)* — if set, the Buy button redirects to a Stripe Payment
  Link with `client_reference_id=<leadId>` appended. Otherwise, an on-the-fly Checkout
  Session is created using `STRIPE_SECRET_KEY`.

## Brand boundaries (don't blur these)

- `CloseHound` stays inside the operator UI (`/dashboard`, internal labels, log lines).
- `WalkPerro` is what the customer sees: the `from` name on outbound mail, the footer line on
  the preview page, the product name on the Stripe receipt.

## What `setup-env.sh` writes vs. what you fill in by hand

The setup script writes the public Supabase + brand vars and leaves the secret values blank.
You fill these in by hand the first time:

- `RESEND_API_KEY`, `RESEND_FROM`
- `GOOGLE_PLACES_API_KEY`
- `GEMINI_API_KEY` (or `GOOGLE_API_KEY`)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_BUY_LINK_BASE`
- `NOTIFY_PURCHASES_TO`, `OUTBOUND_SENDER_FIRST_NAME`, `OUTBOUND_SENDER_PHONE`
