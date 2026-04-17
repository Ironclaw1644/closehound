import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContractorSiteTemplate } from "@/components/site-templates/contractor-site";
import {
  CONTRACTOR_SITE_EXAMPLES,
  getContractorSiteExample,
} from "@/lib/site-templates/contractor";

export function generateStaticParams() {
  return CONTRACTOR_SITE_EXAMPLES.map((example) => ({
    exampleKey: example.key,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ exampleKey: string }>;
}): Promise<Metadata> {
  const { exampleKey } = await params;
  const example = getContractorSiteExample(exampleKey);

  if (!example) {
    return {
      title: "Contractor Template Preview",
    };
  }

  return {
    title: example.data.seo.title,
    description: example.data.seo.description,
  };
}

export default async function ContractorTemplatePreviewPage({
  params,
}: {
  params: Promise<{ exampleKey: string }>;
}) {
  const { exampleKey } = await params;
  const example = getContractorSiteExample(exampleKey);

  if (!example) {
    notFound();
  }

  return (
    <ContractorSiteTemplate
      data={example.data}
      previewLabel={`Preview example - ${example.label}`}
    />
  );
}
