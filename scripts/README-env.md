# CloseHound Env Setup

1. Authenticate the Supabase CLI:

```bash
supabase login
```

2. Link the repo to Vercel if it is not linked yet:

```bash
vercel link
```

3. Sync the client-safe Supabase vars into `.env.local` and the linked Vercel project:

```bash
bash scripts/setup-env.sh
```

4. Optionally pull development envs back from Vercel after the project is linked:

```bash
bash scripts/pull-vercel-env.sh
```

Notes:

- The setup script reads the linked Supabase project ref from local Supabase link state.
- The script prefers existing Supabase CLI auth first. `SUPABASE_ACCESS_TOKEN` is only an optional fallback.
- Only these browser-safe vars are synced to Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_BRAND=WalkPerro` is also managed locally and synced to Vercel.
- Blank placeholders are added locally if missing for:
  - `RESEND_API_KEY`
  - `RESEND_FROM`
  - `NOTIFY_SIGNUPS_TO`
- No service role or server-only secrets are written by these scripts.
- CloseHound is internal-only branding.
- Customer-facing branding and outbound email must use WalkPerro.
- Never expose CloseHound in customer email copy, sender name, or default app branding.
