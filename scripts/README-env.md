# CloseHound Env Setup

Branding model:

- `CloseHound` is the internal operating and sales app brand.
- `WalkPerro` is the external fulfillment and sender brand.
- Customer-facing emails and other customer touchpoints should use `WalkPerro`.
- The internal dashboard and app UI should remain branded `CloseHound`.

1. Authenticate the Supabase CLI:

```bash
supabase login
```

2. Authenticate the Vercel CLI:

```bash
vercel login
```

3. Link the repo to Vercel if it is not linked yet:

```bash
vercel link
```

4. Sync the client-safe Supabase vars into `.env.local` and the linked Vercel project:

```bash
bash scripts/setup-env.sh
```

5. Optionally pull development envs back from Vercel after the project is linked:

```bash
bash scripts/pull-vercel-env.sh
```

Notes:

- The setup script reads the linked Supabase project ref from local Supabase link state.
- The script prefers existing Supabase CLI auth first. `SUPABASE_ACCESS_TOKEN` is only an optional fallback.
- These vars are written or enforced in `.env.local`:
  - `NEXT_PUBLIC_APP_NAME=CloseHound`
  - `NEXT_PUBLIC_APP_BRAND=CloseHound`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE=https://closehound.com`
  - `PREVIEW_SITE=http://localhost:3000` if missing locally
  - `FULFILLMENT_BRAND_NAME=WalkPerro`
  - `OUTBOUND_SENDER_NAME=WalkPerro`
- Blank placeholders are added locally if missing, without overwriting existing filled values, for:
  - `RESEND_API_KEY`
  - `RESEND_FROM`
  - `NOTIFY_SIGNUPS_TO`
- Only these public vars are synced to Vercel:
  - `NEXT_PUBLIC_SITE=https://closehound.com`
  - `PREVIEW_SITE=https://preview.walkperro.com`
  - `NEXT_PUBLIC_APP_NAME`
  - `NEXT_PUBLIC_APP_BRAND`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- No service role or server-only secrets are written by these scripts.
- Do not auto-push blank values for:
  - `RESEND_API_KEY`
  - `RESEND_FROM`
  - `NOTIFY_SIGNUPS_TO`
  - `FULFILLMENT_BRAND_NAME`
  - `OUTBOUND_SENDER_NAME`
- Prevent brand leakage:
  - Keep `CloseHound` inside the internal app.
  - Keep `WalkPerro` in customer email copy, sender name, and other external fulfillment touchpoints.
