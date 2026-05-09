import type { Metadata } from "next";
import { PreviewRouter } from "@/components/preview/PreviewRouter";
import { BuyBar } from "@/components/preview/BuyBar";
import { JsonLd } from "@/components/preview/JsonLd";
import { PreviewNav } from "@/components/preview/multipage/PreviewNav";
import { PreviewFooter } from "@/components/preview/multipage/PreviewFooter";
import { loadPreviewBySlug } from "@/lib/preview/load";
import {
  buildPreviewMetadata,
  buildPreviewJsonLd,
} from "@/lib/preview/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const model = await loadPreviewBySlug(slug);
    return buildPreviewMetadata(model);
  } catch {
    return {
      title: "Preview not found",
      description: "This preview may have expired or been removed.",
      robots: { index: false, follow: false },
    };
  }
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await loadPreviewBySlug(slug);
  const jsonLd = buildPreviewJsonLd(model);

  // Multi-home rendering: wrap the existing single-page template with the
  // multi-page PreviewNav at top and PreviewFooter at bottom. The PreviewNav
  // is sticky so visitors can always reach Services / Service Area / About /
  // Contact, and the in-page anchors still work for the single-page view.
  return (
    <main>
      <JsonLd data={jsonLd} id="preview-jsonld" />
      <PreviewNav model={model} active="home" />
      <PreviewRouter model={model} />
      <PreviewFooter model={model} />
      <BuyBar model={model} />
    </main>
  );
}
