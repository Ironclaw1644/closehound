"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { resolveClaimAuth } from "@/lib/onboarding/session";
import {
  findPreviewSiteById,
  updatePreviewPayload,
  publishPreviewSite,
  setCustomDomain,
  setCustomDomainStatus,
} from "@/lib/onboarding/storage";
import { renderPublishedEmail } from "@/lib/email/templates/published";
import { getSiteOrigin } from "@/lib/preview/seo";
import { ACCENT_PRESET_LIST } from "./constants";
import { attachCustomDomain } from "@/lib/vercel/domains";
import { pingGoogleForUrl } from "@/lib/seo/gsc";

// Server actions called from the editor tabs. Each one verifies the claim
// session, applies a focused patch to preview_payload, and revalidates.

async function requireClaimAuth(token: string): Promise<{ previewSiteId: string }> {
  const payload = await resolveClaimAuth(token);
  if (!payload) {
    redirect("/claim/refresh?status=expired");
  }
  return { previewSiteId: payload.previewSiteId };
}

export async function saveBasicsAction(token: string, formData: FormData) {
  const { previewSiteId } = await requireClaimAuth(token);
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const hours = String(formData.get("hours") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim();

  await updatePreviewPayload({
    previewSiteId,
    patch: {
      basics: {
        phone: phone || null,
        email: email || null,
        hours: hours || null,
        ctaLabel: ctaLabel || null,
      },
    },
  });
  revalidatePath(`/claim/${token}/edit`);
}

export async function saveAboutAction(token: string, formData: FormData) {
  const { previewSiteId } = await requireClaimAuth(token);
  const story = String(formData.get("story") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();

  await updatePreviewPayload({
    previewSiteId,
    patch: {
      about: {
        story: story || null,
        tagline: tagline || null,
      },
    },
  });
  revalidatePath(`/claim/${token}/edit`);
}

export async function saveServiceAreaAction(token: string, formData: FormData) {
  const { previewSiteId } = await requireClaimAuth(token);
  const citiesRaw = String(formData.get("cities") ?? "");
  // Accept comma- or newline-separated lists.
  const cities = citiesRaw
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);

  await updatePreviewPayload({
    previewSiteId,
    patch: { serviceArea: { cities } },
  });
  revalidatePath(`/claim/${token}/edit`);
}

export async function saveBrandAction(token: string, formData: FormData) {
  const { previewSiteId } = await requireClaimAuth(token);
  const accent = String(formData.get("accent") ?? "").trim();
  if (!ACCENT_PRESET_LIST.includes(accent as (typeof ACCENT_PRESET_LIST)[number])) {
    return;
  }

  await updatePreviewPayload({
    previewSiteId,
    patch: { brand: { accent } },
  });
  revalidatePath(`/claim/${token}/edit`);
}

export async function saveDomainAction(token: string, formData: FormData) {
  const { previewSiteId } = await requireClaimAuth(token);
  const raw = String(formData.get("domain") ?? "").trim().toLowerCase();
  if (raw && !/^(?!-)([a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,}$/i.test(raw)) {
    // Silently no-op on bad input; the client validates first.
    return;
  }
  await setCustomDomain({
    previewSiteId,
    domain: raw === "" ? null : raw,
  });
  revalidatePath(`/claim/${token}/edit`);
}

export async function publishAction(token: string) {
  const { previewSiteId } = await requireClaimAuth(token);
  const site = await findPreviewSiteById(previewSiteId);
  if (!site) {
    redirect("/claim/refresh?status=not-found");
  }
  await publishPreviewSite({ previewSiteId });

  // If the buyer set a custom domain, attach it to Vercel and persist the
  // verification status. Fire-and-forget logging on failure — publishing
  // shouldn't fail because Vercel hiccupped.
  if (site.custom_domain) {
    try {
      const result = await attachCustomDomain(site.custom_domain);
      if (result.ok) {
        await setCustomDomainStatus({
          previewSiteId,
          status: {
            verification: result.verification ?? null,
            verified: result.verified,
            attached_at: new Date().toISOString(),
            last_error: null,
          },
        });
      } else {
        await setCustomDomainStatus({
          previewSiteId,
          status: {
            verification: null,
            verified: false,
            last_error: result.error,
          },
        });
        console.warn(
          "[publishAction] vercel domain attach failed:",
          result.error
        );
      }
    } catch (err) {
      console.warn(
        "[publishAction] vercel domain attach threw:",
        err instanceof Error ? err.message : err
      );
    }
  }

  // GSC: ping the canonical URL (and optionally the custom domain too).
  const canonicalUrl = `${getSiteOrigin()}/preview/${site.slug}`;
  void pingGoogleForUrl({ url: canonicalUrl }).catch((err) =>
    console.warn(
      "[publishAction] gsc ping (canonical) failed:",
      err instanceof Error ? err.message : err
    )
  );
  if (site.custom_domain) {
    void pingGoogleForUrl({
      url: `https://${site.custom_domain}/`,
      // Note: the custom domain may not yet be verified in GSC. The Indexing
      // API call will fail if it's not — that's fine, we still pinged the
      // canonical above so SEO discovers the slug regardless.
    }).catch((err) =>
      console.warn(
        "[publishAction] gsc ping (custom-domain) failed:",
        err instanceof Error ? err.message : err
      )
    );
  }

  // Send "your site is live" confirmation email (best-effort).
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (apiKey && site.buyer_email) {
      const liveUrl = `${getSiteOrigin()}/preview/${site.slug}`;
      const businessName = site.slug
        .split("-")
        .slice(0, -1)
        .join(" ")
        .replace(/^\w/, (c: string) => c.toUpperCase());
      const { subject, html, text } = renderPublishedEmail({
        buyerName: site.buyer_name,
        businessName,
        liveUrl,
      });
      const from =
        process.env.RESEND_FROM?.trim() ?? "WalkPerro <hello@walkperro.com>";
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from,
        to: [site.buyer_email],
        subject,
        html,
        text,
      });
    }
  } catch (err) {
    // Email failure shouldn't block the publish. Log + continue.
    console.error(
      "[publishAction] sendPublishedEmail failed:",
      err instanceof Error ? err.message : err
    );
  }

  redirect(`/claim/${token}/edit?published=1`);
}
