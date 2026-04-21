# Junk Removal Template System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `junk-removal-v1` as the next supported blue-collar niche, route supported junk removal leads through the strict template-system preview path, and give the shared blue-collar preview a junk-removal-appropriate visual treatment with real typography choices and Font Awesome icons instead of emoji.

**Architecture:** Reuse the existing `BLUE_COLLAR_SERVICE_FAMILY` and shared `BlueCollarPreviewTemplate` rather than adding a niche-specific renderer, but upgrade that shared blue-collar preview in a family-safe way so it can present junk removal with a more industrial, operational visual language. Add one junk removal niche overlay plus one believable seed business, extend the supported lead preview helper with conservative junk-removal normalization and CTA mapping, add Font Awesome-backed icon fields to the blue-collar preview model instead of emoji shortcuts, then prove the full path with resolver tests and browser verification against the existing `/preview/[slug]` route.

**Tech Stack:** Next.js App Router, TypeScript, Node test runner, existing template-system resolver, existing blue-collar preview model, existing lead preview helper.

---

## File Structure

- Create: `src/lib/template-system/niches/junk-removal.ts`
  - Canonical `junk-removal-v1` niche fixture inside the existing blue-collar family.
- Create: `src/lib/template-system/seeds/junk-removal-seed.ts`
  - Believable seed business with quote-led CTAs and pending conditional proof.
- Modify: `src/lib/template-system/lead-preview.ts`
  - Conservative alias normalization, junk-removal support in `SupportedIndustry`, and junk-removal-specific CTA/seed/template selection.
- Modify: `src/lib/template-system/blue-collar-preview.ts`
  - Add family-safe icon metadata and any small model changes needed for the updated shared preview.
- Modify: `src/components/site-templates/blue-collar-preview.tsx`
  - Apply the `frontend-design` skill to the shared blue-collar surface using junk-removal-appropriate typography, operational styling, and Font Awesome icons instead of emoji.
- Modify: `src/lib/template-system/resolver.test.ts`
  - Failing-first coverage for niche/seed validity, strict proof suppression, normalization, supported routing, blue-collar preview behavior, Font Awesome icon ids, and safe fallback behavior.

## Task 1: Add failing junk removal fixture and suppression tests

**Files:**
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write the failing tests for the junk removal niche and seed**

Add these imports near the other blue-collar imports in `src/lib/template-system/resolver.test.ts`:

```ts
import { JUNK_REMOVAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/junk-removal";
import { JUNK_REMOVAL_SEED_BUSINESS } from "@/lib/template-system/seeds/junk-removal-seed";
```

Add these tests near the existing roofing / HVAC / plumbing niche checks:

```ts
test("junk removal niche matches blue-collar family and schema version", () => {
  assert.equal(
    JUNK_REMOVAL_NICHE_TEMPLATE.familyKey,
    BLUE_COLLAR_SERVICE_FAMILY.key
  );
  assert.equal(
    JUNK_REMOVAL_NICHE_TEMPLATE.expectedSchemaVersion,
    BLUE_COLLAR_SERVICE_FAMILY.schemaVersion
  );
});

test("junk removal seed business keeps unsupported proof pending", () => {
  assert.equal(
    JUNK_REMOVAL_SEED_BUSINESS.conditionalProof.sameDayPickup?.approvalStatus,
    "pending"
  );
  assert.equal(
    JUNK_REMOVAL_SEED_BUSINESS.conditionalProof.licensedAndInsured?.approvalStatus,
    "pending"
  );
  assert.equal(
    JUNK_REMOVAL_SEED_BUSINESS.conditionalProof.ecoFriendlyDisposal?.approvalStatus,
    "pending"
  );
  assert.equal(
    JUNK_REMOVAL_SEED_BUSINESS.conditionalProof.recyclingFirst?.approvalStatus,
    "pending"
  );
  assert.equal(
    JUNK_REMOVAL_SEED_BUSINESS.conditionalProof.donationDropOff?.approvalStatus,
    "pending"
  );
  assert.equal(
    JUNK_REMOVAL_SEED_BUSINESS.conditionalProof.upfrontPricingGuarantee?.approvalStatus,
    "pending"
  );
  assert.equal(
    JUNK_REMOVAL_SEED_BUSINESS.conditionalProof.sampleTestimonials?.approvalStatus,
    "pending"
  );
});
```

- [ ] **Step 2: Extend the test file with a failing strict suppression assertion**

Add this test after the other strict resolver suppression tests:

```ts
test("strict resolver suppresses unsupported junk removal proof claims", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: JUNK_REMOVAL_NICHE_TEMPLATE,
    seed: JUNK_REMOVAL_SEED_BUSINESS,
    sampleMode: "strict",
  });

  assert.equal(render.status.isPreviewSafe, true);
  assert.equal(render.status.hasSuppressedClaims, true);
  assert.deepEqual(
    render.overrideAudit.suppressed.map((entry) => entry.field),
    [
      "sameDayPickup",
      "licensedAndInsured",
      "ecoFriendlyDisposal",
      "recyclingFirst",
      "donationDropOff",
      "upfrontPricingGuarantee",
      "sampleTestimonials",
    ]
  );
});
```

- [ ] **Step 3: Run the unit tests to verify they fail for missing junk removal modules**

Run:

```bash
npm run test:unit
```

Expected: FAIL with module resolution errors for `@/lib/template-system/niches/junk-removal` and `@/lib/template-system/seeds/junk-removal-seed`.

- [ ] **Step 4: Add the minimal junk removal niche fixture and seed business**

Create `src/lib/template-system/niches/junk-removal.ts`:

```ts
import type { NicheTemplate } from "@/lib/template-system/types";

export const JUNK_REMOVAL_NICHE_TEMPLATE: NicheTemplate = {
  key: "junk-removal-v1",
  familyKey: "blue-collar-service",
  name: "Junk Removal",
  version: "1.0.0",
  expectedSchemaVersion: "1.0.0",
  canonicalStyle: {
    tone: "operational, fast-moving, quote-led",
    typography: {
      headingFamily: "var(--font-geist-sans)",
      bodyFamily: "var(--font-geist-sans)",
      sizingNotes: ["high-clarity hero", "group job types instead of item lists"],
    },
    palette: {
      base: ["#111827", "#f8fafc"],
      accents: ["#0f766e", "#f59e0b"],
      usageNotes: ["keep the layout bright and practical", "reserve warm accent color for quote CTAs"],
    },
    layoutNotes: [
      "hero should support fast pickups and planned cleanouts",
      "service cards should describe job types, not endless item categories",
      "proof posture stays operational rather than hype-heavy",
    ],
  },
  vocabulary: {
    requiredTerms: ["junk removal", "cleanout", "haul-away", "quote"],
    preferredPhrases: ["clear the space", "remove unwanted items", "next-step pricing"],
    bannedPhrases: ["we take anything", "eco-friendly guaranteed", "same-day pickup guaranteed"],
    disallowedProofClaims: [
      "licensed and insured",
      "recycling first",
      "donation drop-off",
      "up-front pricing guarantee",
    ],
  },
  seo: {
    metaTitleTemplate: "{{serviceAreaLabel}} Junk Removal | {{businessName}}",
    metaDescriptionTemplate:
      "{{businessName}} handles junk pickup, cleanouts, and haul-away work in {{serviceAreaLabel}} for homes and light commercial spaces.",
    headingRules: [
      "mention junk removal and geography in the hero",
      "support both quick pickups and larger cleanout jobs",
    ],
    keywordTargets: [
      "junk removal",
      "junk pickup",
      "property cleanout",
      "haul away service",
    ],
  },
  sections: {
    copy: {
      hero: {
        variantKey: "quote-led",
        heading: "Junk removal for pickups, cleanouts, and haul-away work",
        body:
          "{{businessName}} helps {{serviceAreaLabel}} homeowners, landlords, and small businesses clear unwanted items with a clear quote process and organized removal plan.",
        cta: { label: "Get a Quote", action: "quote" },
      },
      services: {
        variantKey: "grouped",
        heading: "Junk removal services built around real job types",
        items: [
          {
            title: "Home Pickups",
            body: "Furniture, appliances, and general household items that need to be removed without turning the visit into a full property cleanout.",
          },
          {
            title: "Garage / Storage Cleanouts",
            body: "Overflowing garages, attic storage, sheds, and accumulated items that need a planned cleanout.",
          },
          {
            title: "Move-Out / Property Cleanups",
            body: "Rental turnovers, move-out debris, and light commercial or office junk removal that needs a clear scope.",
          },
        ],
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "What matters when you hire a junk removal crew",
        items: [
          {
            title: "Clear scope before pickup",
            body: "Set expectations around what needs to go, what stays, and how the removal visit will work.",
          },
          {
            title: "Organized arrival and loading",
            body: "Keep the job moving with a practical crew process instead of vague urgency claims.",
          },
          {
            title: "Quote-first communication",
            body: "Make the next step obvious whether the job is a single pickup or a larger cleanout.",
          },
        ],
      },
      process: {
        variantKey: "default",
        heading: "How junk removal moves from estimate to cleared space",
        items: [
          {
            title: "Review the job",
            body: "Confirm what needs to be removed, access points, and whether the work is a pickup or a larger cleanout.",
          },
          {
            title: "Quote the scope",
            body: "Set the next step with clear pricing language and a defined scope of work.",
          },
          {
            title: "Load and clear the area",
            body: "Remove the agreed items efficiently and leave the space ready for what comes next.",
          },
        ],
      },
      faq: {
        variantKey: "mixed-intent",
        heading: "Junk removal questions people ask before booking",
        faqItems: [
          {
            question: "Do you only handle single-item pickups?",
            answer:
              "No. Junk removal jobs can range from a few bulky items to larger cleanouts for garages, storage areas, move-outs, and similar spaces.",
          },
          {
            question: "Can I get a quote before scheduling the job?",
            answer:
              "Yes. A clear quote helps confirm the scope, access, and next step before the removal visit is booked.",
          },
        ],
      },
      "service-area": {
        variantKey: "regional-coverage",
        heading: "Junk removal in {{serviceAreaLabel}}",
        body: "{{businessName}} handles household pickups, cleanouts, and haul-away work throughout {{serviceAreaLabel}}.",
      },
      contact: {
        variantKey: "dual-cta",
        heading: "Get a junk removal quote or call now",
        body: "Request pricing for cleanouts and haul-away work, or call now to talk through the pickup.",
        cta: { label: "Get a Quote", action: "quote" },
      },
    },
  },
  editableModel: {
    lockedFields: ["heroHeading", "sectionOrder", "claimPolicy"],
    editableFields: [
      "businessName",
      "serviceAreaLabel",
      "primaryPhone",
      "contactEmail",
      "services",
      "primaryCtaLabel",
      "primaryCtaHref",
      "secondaryCtaLabel",
      "secondaryCtaHref",
    ],
    conditionalFields: [
      "sameDayPickup",
      "licensedAndInsured",
      "ecoFriendlyDisposal",
      "recyclingFirst",
      "donationDropOff",
      "upfrontPricingGuarantee",
      "sampleTestimonials",
    ],
  },
};
```

Create `src/lib/template-system/seeds/junk-removal-seed.ts`:

```ts
import type { SeedBusiness } from "@/lib/template-system/types";

export const JUNK_REMOVAL_SEED_BUSINESS: SeedBusiness = {
  key: "clearpath-junk-removal-raleigh",
  nicheTemplateKey: "junk-removal-v1",
  businessProfile: {
    businessName: "ClearPath Junk Removal",
    serviceAreaLabel: "Raleigh, NC",
    primaryPhone: "(919) 555-0168",
    contactEmail: "quotes@clearpathjunk.com",
    primaryCtaLabel: "Get a Quote",
    primaryCtaHref: "#contact",
    secondaryCtaLabel: "Call Now",
    secondaryCtaHref: "tel:+19195550168",
    services: [
      "Home Pickups",
      "Garage / Storage Cleanouts",
      "Move-Out / Property Cleanups",
    ],
  },
  conditionalProof: {
    sameDayPickup: {
      kind: "availability-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    licensedAndInsured: {
      kind: "credential-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    ecoFriendlyDisposal: {
      kind: "process-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    recyclingFirst: {
      kind: "process-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    donationDropOff: {
      kind: "service-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    upfrontPricingGuarantee: {
      kind: "offer-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    sampleTestimonials: {
      kind: "testimonial-list",
      value: 0,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: true,
    },
  },
};
```

- [ ] **Step 5: Run the unit tests to verify the new fixture tests pass**

Run:

```bash
npm run test:unit
```

Expected: PASS for the new junk-removal niche / seed / suppression tests, with any remaining failures limited to the still-unimplemented lead-preview routing tests from Task 2.

## Task 2: Add failing lead-preview normalization and routing tests

**Files:**
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Add failing normalization coverage for conservative junk removal aliases**

Add these tests near the other `normalizeSupportedIndustry` checks:

```ts
test("supported-industry helper normalizes junk removal variants", () => {
  assert.equal(normalizeSupportedIndustry("junk removal"), "junk removal");
  assert.equal(normalizeSupportedIndustry("Junk Hauling"), "junk removal");
  assert.equal(normalizeSupportedIndustry("junk hauling service"), "junk removal");
  assert.equal(normalizeSupportedIndustry("junk pickup"), "junk removal");
  assert.equal(normalizeSupportedIndustry("haul away"), "junk removal");
  assert.equal(normalizeSupportedIndustry("cleanout service"), "junk removal");
  assert.equal(normalizeSupportedIndustry("property cleanout"), "junk removal");
  assert.equal(normalizeSupportedIndustry("debris removal"), null);
  assert.equal(normalizeSupportedIndustry("moving company"), null);
});
```

- [ ] **Step 2: Add failing supported-preview, icon, and blue-collar model assertions**

Add these tests near the plumbing preview tests:

```ts
test("supported junk removal lead resolves to the blue-collar family and template", () => {
  const supported = resolveLeadTemplatePreview({
    id: "lead-jr-1",
    industry: "junk hauling",
    company_name: "ClearPath Junk Removal",
    city: "Raleigh",
    state: "NC",
    phone: "(919) 555-0168",
    email: "quotes@clearpathjunk.com",
  } as never);

  assert.equal(supported.supported, true);
  if (!supported.supported) {
    return;
  }

  assert.equal(supported.familyKey, BLUE_COLLAR_SERVICE_FAMILY.key);
  assert.equal(supported.templateKey, JUNK_REMOVAL_NICHE_TEMPLATE.key);
});

test("lead preview view uses the shared blue-collar path for junk removal leads", () => {
  const junkRemovalView = buildLeadPreviewView({
    id: "lead-jr-2",
    status: "generated",
    industry: "junk removal",
    company_name: "ClearPath Junk Removal",
    city: "Raleigh",
    phone: "(919) 555-0168",
    contact_email: "quotes@clearpathjunk.com",
  } as never);

  assert.equal(junkRemovalView.kind, "blue-collar");
  if (junkRemovalView.kind !== "blue-collar") {
    return;
  }

  assert.equal(
    junkRemovalView.model.hero.heading,
    "Junk removal for pickups, cleanouts, and haul-away work"
  );
  assert.equal(junkRemovalView.model.hero.primaryCta.label, "Get a Quote");
  assert.equal(junkRemovalView.model.hero.secondaryCta?.label, "Call Now");
  assert.equal(junkRemovalView.model.hero.secondaryCta?.href, "tel:+19195550168");
  assert.deepEqual(
    junkRemovalView.model.services.items.map((item) => item.title),
    [
      "Home Pickups",
      "Garage / Storage Cleanouts",
      "Move-Out / Property Cleanups",
    ]
  );
});

test("junk removal preview model uses Font Awesome icon ids, not emoji", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: JUNK_REMOVAL_NICHE_TEMPLATE,
    seed: JUNK_REMOVAL_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const preview = buildBlueCollarPreviewModel(render);

  assert.equal(preview.hero.badgeIcon, "truck-ramp-box");
  assert.equal(preview.services.items[0]?.icon, "couch");
  assert.equal(preview.process.items[0]?.icon, "clipboard-check");
});

test("junk removal leads fall back to legacy when the render is unsafe", () => {
  const legacyView = buildLeadPreviewView(
    {
      id: "lead-jr-3",
      status: "generated",
      industry: "junk removal",
      company_name: "ClearPath Junk Removal",
      city: "Raleigh",
      phone: "(919) 555-0168",
      contact_email: "quotes@clearpathjunk.com",
      preview_url:
        "https://preview.closehound.local/preview/clearpath-junk-removal-raleigh-123",
    } as never,
    () => ({
      supported: false,
      reason: "UNSAFE_RENDER" as const,
    })
  );

  assert.equal(legacyView.kind, "legacy");
  assert.equal(legacyView.reason, "UNSAFE_RENDER");
  assert.equal(legacyView.fallbackSlug, "clearpath-junk-removal-raleigh-123");
});
```

- [ ] **Step 3: Run the unit tests to confirm the routing assertions fail before helper changes**

Run:

```bash
npm run test:unit
```

Expected: FAIL with `normalizeSupportedIndustry(...)` returning `null` for junk-removal aliases and `resolveLeadTemplatePreview(...)` returning unsupported results for junk-removal leads.

## Task 3: Extend the supported lead-preview helper for junk removal

**Files:**
- Modify: `src/lib/template-system/lead-preview.ts`

- [ ] **Step 1: Add the junk removal imports and supported-industry type**

Update the import block and union type in `src/lib/template-system/lead-preview.ts`:

```ts
import { JUNK_REMOVAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/junk-removal";
import { JUNK_REMOVAL_SEED_BUSINESS } from "@/lib/template-system/seeds/junk-removal-seed";

type SupportedIndustry =
  | "roofing"
  | "hvac"
  | "plumbing"
  | "junk removal"
  | "med-spa"
  | "dental";
```

- [ ] **Step 2: Add conservative alias handling and junk-removal CTA mapping**

Add this alias set near the other industry aliases:

```ts
const JUNK_REMOVAL_INDUSTRY_ALIASES = new Set([
  "junk removal",
  "junk hauling",
  "junk hauling service",
  "junk pickup",
  "haul away",
  "cleanout service",
  "property cleanout",
]);
```

Update the CTA mapping inside `buildLeadRecord(...)`:

```ts
  const primaryCtaLabel =
    industry === "roofing"
      ? "Request a Roofing Quote"
      : industry === "hvac"
        ? "Request HVAC Service"
        : industry === "plumbing"
          ? "Call Now"
          : industry === "junk removal"
            ? "Get a Quote"
            : industry === "dental"
              ? "Schedule Visit"
              : "Book Consultation";

  const primaryCtaHref =
    industry === "plumbing" && lead.phone?.trim()
      ? `tel:${lead.phone.trim()}`
      : "#contact";

  const secondaryCtaLabel =
    industry === "plumbing"
      ? "Request Estimate"
      : industry === "junk removal"
        ? "Call Now"
        : industry === "dental"
          ? "View Services"
          : industry === "med-spa"
            ? "View Treatments"
            : null;

  const secondaryCtaHref =
    industry === "plumbing"
      ? "#contact"
      : industry === "junk removal" && lead.phone?.trim()
        ? `tel:${lead.phone.trim()}`
        : industry === "dental"
          ? "#services"
          : industry === "med-spa"
            ? "#services"
            : null;
```

- [ ] **Step 3: Route junk-removal leads through the existing blue-collar resolver path**

Update the template / seed selection and normalization flow:

```ts
  const template =
    templateKey === "roofing"
      ? ROOFING_NICHE_TEMPLATE
      : templateKey === "hvac"
        ? HVAC_NICHE_TEMPLATE
        : templateKey === "plumbing"
          ? PLUMBING_NICHE_TEMPLATE
          : templateKey === "junk removal"
            ? JUNK_REMOVAL_NICHE_TEMPLATE
            : templateKey === "dental"
              ? DENTAL_NICHE_TEMPLATE
              : MED_SPA_NICHE_TEMPLATE;

  const seed =
    templateKey === "roofing"
      ? ROOFING_SEED_BUSINESS
      : templateKey === "hvac"
        ? HVAC_SEED_BUSINESS
        : templateKey === "plumbing"
          ? PLUMBING_SEED_BUSINESS
          : templateKey === "junk removal"
            ? JUNK_REMOVAL_SEED_BUSINESS
            : templateKey === "dental"
              ? DENTAL_SEED_BUSINESS
              : MED_SPA_SEED_BUSINESS;
```

Add normalization and resolver branches:

```ts
  if (JUNK_REMOVAL_INDUSTRY_ALIASES.has(value)) {
    return "junk removal";
  }

  if (normalizedIndustry === "junk removal") {
    return resolveSupportedPreview("junk removal", lead);
  }
```

- [ ] **Step 4: Run the unit tests to verify the junk-removal routing path passes**

Run:

```bash
npm run test:unit
```

Expected: PASS for the new normalization, supported-preview, blue-collar preview-model, Font Awesome icon-id, and unsafe-fallback junk-removal tests.

## Task 4: Upgrade the shared blue-collar preview with the frontend-design skill

**Files:**
- Modify: `src/lib/template-system/blue-collar-preview.ts`
- Modify: `src/components/site-templates/blue-collar-preview.tsx`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Add failing preview-model and markup assertions for the new shared design direction**

Add or extend tests in `src/lib/template-system/resolver.test.ts`:

```ts
test("blue-collar preview model exposes icon metadata for junk removal sections", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: JUNK_REMOVAL_NICHE_TEMPLATE,
    seed: JUNK_REMOVAL_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const preview = buildBlueCollarPreviewModel(render);

  assert.equal(preview.hero.badgeLabel, "Junk removal");
  assert.equal(preview.hero.badgeIcon, "truck-ramp-box");
  assert.equal(preview.contact.phoneIcon, "phone");
});

test("blue-collar preview component renders junk-removal styling without emoji", async () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: JUNK_REMOVAL_NICHE_TEMPLATE,
    seed: JUNK_REMOVAL_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const model = buildBlueCollarPreviewModel(render);
  const { BlueCollarPreviewTemplate } = await loadBlueCollarPreviewTemplate();
  const html = renderToStaticMarkup(createElement(BlueCollarPreviewTemplate, { model }));

  assert.ok(html.includes("Get a Quote"));
  assert.ok(html.includes("Home Pickups"));
  assert.equal(html.includes("🚚"), false);
  assert.equal(html.includes("🧹"), false);
  assert.equal(html.includes("♻️"), false);
});
```

- [ ] **Step 2: Update the preview model with explicit icon ids and junk-removal-friendly labels**

Adjust `src/lib/template-system/blue-collar-preview.ts` so the model carries icon ids that the component can map through Font Awesome:

```ts
export type BlueCollarPreviewIcon =
  | "truck-ramp-box"
  | "couch"
  | "warehouse"
  | "building"
  | "clipboard-check"
  | "phone"
  | "location-dot"
  | "circle-question";
```

Then shape the model so hero / services / why-choose-us / process / contact expose icon fields:

```ts
hero: {
  badgeLabel: string;
  badgeIcon: BlueCollarPreviewIcon;
  ...
}
```

- [ ] **Step 3: Apply `skills/frontend-design` to the shared blue-collar preview component**

Use `anthropics/skills --path=skills/frontend-design` before editing `src/components/site-templates/blue-collar-preview.tsx`.

Implementation direction:

```text
- visual tone: industrial / utilitarian / fast-moving local crew
- typography: choose a distinctive condensed or editorial display face paired with a clean, readable sans
- avoid generic SaaS styling and avoid emoji entirely
- use Font Awesome icons for CTA, service cards, process steps, FAQ, and contact rows
- keep the update family-safe so roofing / HVAC / plumbing also render cleanly
```

Concrete component requirements:

```ts
import {
  faBuilding,
  faCircleQuestion,
  faClipboardCheck,
  faCouch,
  faLocationDot,
  faPhone,
  faTruckRampBox,
  faWarehouse,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
```

- [ ] **Step 4: Run the unit tests again after the shared preview update**

Run:

```bash
npm run test:unit
```

Expected: PASS for the junk-removal preview-model and no-emoji markup assertions, with existing blue-collar preview tests still passing.

## Task 5: Verify the full junk removal path

**Files:**
- Modify: none expected unless verification exposes a family-safe gap

- [ ] **Step 1: Run the focused validation commands**

Run:

```bash
npm run test:unit
npm run typecheck
npm run build
```

Expected: all three commands PASS.

- [ ] **Step 2: Start the app and verify a junk removal preview through the existing preview route**

Run:

```bash
npm run dev
```

Expected: local dev server starts successfully.

Then verify one supported junk-removal lead preview, either by using an existing seeded preview-safe lead or by temporarily pointing a local lead fixture at:

```text
/preview/<junk-removal-lead-uuid>
```

What to confirm in the browser:

```text
1. The page renders through the shared blue-collar preview template.
2. The hero uses the junk-removal headline and "Get a Quote" CTA.
3. The services section shows the three grouped job-type cards.
4. No unsupported same-day / licensed / recycling / donation / pricing-guarantee / testimonial proof appears.
5. An unsupported industry slug or unsafe render still falls back to the legacy preview path.
```

- [ ] **Step 3: If verification exposes a renderer issue, make the smallest family-safe follow-up**

Allowed follow-up shape:

```ts
// Only if the shared blue-collar preview model cannot represent
// an already-resolved junk-removal section cleanly.
```

Not allowed:

```ts
// Do not add a junk-removal-specific preview component or page branch
// unless the shared blue-collar path is provably insufficient.
```
