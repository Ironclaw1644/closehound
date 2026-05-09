import { redirect } from "next/navigation";
import { verifyOnboardingToken } from "@/lib/onboarding/token";
import { setClaimSession } from "@/lib/onboarding/session";
import {
  findPreviewSiteById,
  markPreviewSiteClaimed,
} from "@/lib/onboarding/storage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Claim your site",
  robots: { index: false, follow: false },
};

export default async function ClaimLandingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const payload = await verifyOnboardingToken(token);

  if (!payload) {
    return <ClaimError reason="invalid" />;
  }

  // Verify the preview_site still exists.
  const site = await findPreviewSiteById(payload.previewSiteId);
  if (!site) {
    return <ClaimError reason="not-found" />;
  }

  // Set the session cookie so subsequent /claim navigation works.
  await setClaimSession(token);

  // Mark first-time claim if not already.
  if (!site.claimed_at) {
    await markPreviewSiteClaimed({ previewSiteId: site.id });
  }

  // Redirect to the editor.
  redirect(`/claim/${encodeURIComponent(token)}/edit`);
}

function ClaimError({ reason }: { reason: "invalid" | "not-found" }) {
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#0e0e0e]">
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#6b6b6b]">
          WalkPerro
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {reason === "invalid"
            ? "Your claim link expired"
            : "We couldn't find your site"}
        </h1>
        <p className="mt-4 text-base leading-7 text-[#3a3a3a]">
          {reason === "invalid"
            ? "Claim links are valid for 30 days. Request a new one — we'll send it to the email tied to your purchase."
            : "It looks like the site associated with this claim link no longer exists. Reply to the receipt email and we'll sort it out within a day."}
        </p>
        <a
          href="/claim/refresh"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0e0e0e] px-6 py-3 text-sm font-semibold text-[#f5f1e8] transition hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
        >
          {reason === "invalid" ? "Send me a new link" : "Contact support"}
        </a>
      </div>
    </div>
  );
}
