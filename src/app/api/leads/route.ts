import { NextResponse } from "next/server";
import { z } from "zod";
import { getClosehoundAdminSchema, hasSupabaseAdminEnv } from "@/lib/supabase";
import { getResendClient, getOutboundSender } from "@/lib/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email().max(200),
  source: z.string().max(80).optional(),
});

const SITE = process.env.NEXT_PUBLIC_SITE?.trim().replace(/\/+$/, "") || "https://closehound.com";

// Anonymous email capture → closehound.leads (service-role; RLS-locked table).
// Idempotent on email; a welcome email goes out only on a genuinely new signup.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ ok: true }); // gracefully no-op if unconfigured
  }

  const email = parsed.data.email.trim().toLowerCase();
  const db = getClosehoundAdminSchema();
  const { data, error } = await db
    .from("leads")
    .upsert({ email, source: parsed.data.source ?? "guide" }, { onConflict: "email", ignoreDuplicates: true })
    .select("email");
  if (error) {
    return NextResponse.json({ error: "Could not subscribe — try again." }, { status: 500 });
  }

  // ignoreDuplicates → a row comes back only when it was newly inserted.
  const isNew = Array.isArray(data) && data.length > 0;
  if (isNew && process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
    try {
      await sendWelcome(email);
    } catch {
      /* non-fatal — the lead is captured regardless */
    }
  }

  return NextResponse.json({ ok: true });
}

async function sendWelcome(to: string) {
  // Keep the verified sending domain (RESEND_FROM) but brand it as CloseHound.
  const raw = getOutboundSender();
  const addr = raw.match(/<([^>]+)>/)?.[1] ?? raw;
  const pdf = `${SITE}/section8-playbook.pdf`;
  const guide = `${SITE}/guide`;
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a16">
    <p style="font-size:18px;font-weight:700;margin:0 0 4px">Your Section 8 playbook is ready 🐾</p>
    <p style="font-size:15px;line-height:1.6;color:#5c5a52;margin:8px 0 18px">
      Thanks for joining CloseHound. Here's the full Section 8 investor's playbook — how the voucher pays you,
      passing the HQS/NSPIRE inspection, financing, finding tenants, and managing the rental.
    </p>
    <p style="margin:0 0 10px">
      <a href="${pdf}" style="display:inline-block;background:#1a1a16;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600;font-size:14px">Download the PDF</a>
      &nbsp;
      <a href="${guide}" style="font-size:14px;color:#8a6d2e">Read it online →</a>
    </p>
    <p style="font-size:15px;line-height:1.6;color:#5c5a52;margin:20px 0 8px">
      When you're ready to find a deal, screen live listings against HUD voucher rents and rank them by Deal Score:
    </p>
    <p style="margin:0 0 18px">
      <a href="${SITE}/screen" style="font-size:14px;color:#8a6d2e;font-weight:600">Open the screener — free →</a>
    </p>
    <p style="font-size:12px;color:#9a9a93;line-height:1.5;border-top:1px solid #e6e1d4;padding-top:12px">
      General educational guidance, not legal or financial advice. Section 8 rules vary by Public Housing Authority —
      verify specifics locally. You're getting this because you signed up at closehound.com.
    </p>
  </div>`;
  await getResendClient().emails.send({
    from: `CloseHound <${addr}>`,
    to,
    subject: "Your Section 8 investing playbook",
    html,
  });
}
