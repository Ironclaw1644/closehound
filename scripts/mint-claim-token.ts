// One-shot helper: mints a fresh /claim/<token>/edit URL for the demo preview
// site. Reads the slug from CLI arg (defaults to the Spicewood handyman demo).
// Run with: npm run mint:claim-token -- [slug]
//   (uses node --env-file=.env.local under the hood; same pattern as the other
//   one-shot scripts in package.json)
import {
  findPreviewSiteBySlug,
  mintAndPersistOnboardingToken,
} from "@/lib/onboarding/storage";
import { getSiteOrigin } from "@/lib/preview/seo";

async function main() {
  const slug =
    process.argv[2] ??
    "ace-handyman-services-nw-austin-spicewood-spicewood-b45464";
  const site = await findPreviewSiteBySlug(slug);
  if (!site) {
    console.error(`No preview_site found for slug: ${slug}`);
    process.exit(1);
  }
  const email = site.buyer_email ?? "demo@walkperro.com";
  const token = await mintAndPersistOnboardingToken({
    previewSiteId: site.id,
    leadId: site.lead_id,
    email,
    ttlDays: 14,
  });
  const origin = getSiteOrigin();
  console.log("");
  console.log(`Slug:  ${slug}`);
  console.log(`Email: ${email}`);
  console.log("");
  console.log("Claim URL (clicks once, sets cookie, redirects to editor):");
  console.log(`  ${origin}/claim/${token}`);
  console.log("");
  console.log("Editor URL (use after the cookie is set):");
  console.log(`  ${origin}/claim/${token}/edit?tab=services`);
  console.log("");
  console.log("Or for local dev:");
  console.log(`  http://localhost:3000/claim/${token}`);
  console.log(`  http://localhost:3000/claim/${token}/edit?tab=services`);
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
