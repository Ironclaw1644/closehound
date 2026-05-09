import { redirect } from "next/navigation";
import { Resend } from "resend";
import {
  getSupabaseAdminClient,
  hasSupabaseAdminEnv,
} from "@/lib/supabase";
import { mintAndPersistOnboardingToken } from "@/lib/onboarding/storage";
import { renderClaimEmail } from "@/lib/email/templates/claim";
import { getSiteOrigin } from "@/lib/preview/seo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Request a new claim link",
  robots: { index: false, follow: false },
};

async function refreshAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect("/claim/refresh?status=invalid-email");
  }
  if (!hasSupabaseAdminEnv()) {
    redirect("/claim/refresh?status=server-error");
  }

  // Look up the most-recent preview_site for this email
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walkperro: any = (
    getSupabaseAdminClient() as unknown as { schema: (s: string) => unknown }
  ).schema("walkperro");
  const { data, error } = await walkperro
    .from("preview_sites")
    .select("id, slug, lead_id, buyer_email, buyer_name")
    .eq("buyer_email", email)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) {
    // Don't reveal whether the email exists; show a generic success state.
    redirect("/claim/refresh?status=sent");
  }
  const site = data[0];

  // Mint + persist new token
  const token = await mintAndPersistOnboardingToken({
    previewSiteId: site.id,
    leadId: site.lead_id,
    email: site.buyer_email,
  });

  // Send the email (best-effort — Resend may not be configured in dev)
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const claimUrl = `${getSiteOrigin()}/claim/${encodeURIComponent(token)}`;
    const { subject, html, text } = renderClaimEmail({
      buyerName: site.buyer_name,
      buyerEmail: site.buyer_email,
      businessName: site.slug.split("-").slice(0, -1).join(" ").replace(/^\w/, (c: string) => c.toUpperCase()),
      claimUrl,
      expiresInDays: 30,
    });
    const from = process.env.RESEND_FROM?.trim() ?? "WalkPerro <hello@walkperro.com>";
    const resend = new Resend(resendKey);
    await resend.emails.send({ from, to: [email], subject, html, text });
  }

  redirect("/claim/refresh?status=sent");
}

export default async function RefreshPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#0e0e0e]">
      <div className="mx-auto max-w-xl px-6 py-24">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#6b6b6b]">
          WalkPerro · Onboarding
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Request a new claim link
        </h1>

        {status === "sent" ? (
          <p className="mt-6 rounded-2xl bg-white px-6 py-5 text-base leading-7 ring-1 ring-black/10">
            Check your inbox. If a site is associated with that email, you'll
            receive a fresh claim link within a few minutes.
          </p>
        ) : null}
        {status === "invalid-email" ? (
          <p className="mt-6 rounded-2xl bg-[#fff1f1] px-6 py-5 text-base leading-7 ring-1 ring-[#c33a3a]/30 text-[#7a2222]">
            That doesn't look like a valid email — try again.
          </p>
        ) : null}

        <form action={refreshAction} className="mt-8 flex flex-col gap-4">
          <label htmlFor="email" className="text-sm font-semibold">
            Email tied to your purchase
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="rounded-2xl bg-white px-5 py-4 text-base ring-1 ring-black/10 outline-none transition focus:ring-2 focus:ring-[#ebff00]"
          />
          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-[#0e0e0e] px-6 py-3.5 text-sm font-semibold text-[#ebff00] transition hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
          >
            Send me a new link
          </button>
        </form>

        <p className="mt-8 text-sm leading-6 text-[#6b6b6b]">
          If you never received the original email, check your spam folder
          first. If you're still stuck, reply to your Stripe receipt and we'll
          fix it within a day.
        </p>
      </div>
    </div>
  );
}
