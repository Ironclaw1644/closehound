import { PreviewSite } from "@/components/preview/PreviewSite";
import { BuyBar } from "@/components/preview/BuyBar";
import { loadPreviewBySlug } from "@/lib/preview/load";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await loadPreviewBySlug(slug);

  return (
    <>
      <PreviewSite model={model} />
      <BuyBar model={model} />
    </>
  );
}
