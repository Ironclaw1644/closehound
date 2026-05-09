import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { LeadIndustry } from "@/lib/industries";
import { TARGET_INDUSTRIES } from "@/lib/industries";
import { PreviewRouter } from "@/components/preview/PreviewRouter";
import { JsonLd } from "@/components/preview/JsonLd";
import { buildSamplePreviewModel } from "@/lib/preview/sample-data";
import {
  buildIndustryTemplateMetadata,
  buildIndustryTemplateJsonLd,
} from "@/lib/preview/seo";

const VALID_SLUGS: Record<string, LeadIndustry> = {
  handyman: "handyman",
  "pressure-washing": "pressure washing",
  roofing: "roofing",
  hvac: "HVAC",
  plumbing: "plumbing",
  dental: "dental",
  "med-spa": "med spa",
  "junk-removal": "junk removal",
  "mobile-detailing": "mobile detailing",
  landscaping: "landscaping",
  painting: "painting",
  electrical: "electrical",
  "auto-repair": "auto repair",
  "pest-control": "pest control",
};

export function generateStaticParams() {
  return Object.keys(VALID_SLUGS).map((industry) => ({ industry }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string }>;
}): Promise<Metadata> {
  const { industry: slug } = await params;
  const industry = VALID_SLUGS[slug];
  if (!industry) {
    return {
      title: "Template not found",
      robots: { index: false, follow: false },
    };
  }
  return buildIndustryTemplateMetadata(industry);
}

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const { industry: slug } = await params;
  const industry = VALID_SLUGS[slug];
  if (!industry) {
    notFound();
  }
  const model = buildSamplePreviewModel(industry);
  const jsonLd = buildIndustryTemplateJsonLd(industry);

  return (
    <main>
      <JsonLd data={jsonLd} id="template-jsonld" />
      <div className="fixed left-3 top-3 z-50 rounded-full border border-black/10 bg-white/85 px-3 py-1 text-[11px] font-medium tracking-wide text-black/70 shadow-sm backdrop-blur">
        Template preview · {industry}
      </div>
      <nav className="fixed right-3 top-3 z-50 flex max-w-[calc(100vw-1.5rem)] flex-wrap justify-end gap-1 rounded-full border border-black/10 bg-white/85 p-1 shadow-sm backdrop-blur">
        {TARGET_INDUSTRIES.map((opt) => {
          const optSlug = Object.entries(VALID_SLUGS).find(
            ([, val]) => val === opt.value
          )?.[0];
          if (!optSlug) return null;
          const active = optSlug === slug;
          return (
            <a
              key={opt.value}
              href={`/preview/templates/${optSlug}`}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide transition ${
                active
                  ? "bg-black text-white"
                  : "text-black/60 hover:bg-black/5 hover:text-black"
              }`}
            >
              {opt.label}
            </a>
          );
        })}
      </nav>
      <PreviewRouter model={model} />
    </main>
  );
}
