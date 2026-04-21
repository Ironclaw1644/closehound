import {
  buildTemplateReviewSummaryFromRecords,
  listTemplateImageCandidatesByTemplate,
  listTemplateImageBatchSummaries,
} from "@/lib/template-system/images/repository";
import {
  TEMPLATE_IMAGE_REVIEW_TEMPLATES,
} from "@/lib/template-system/images/review-registry";
import { TemplateImageIndex } from "@/components/template-images/template-image-index";
import { hasSupabaseAdminEnv } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function TemplateImagesIndexPage() {
  const items = await Promise.all(
    TEMPLATE_IMAGE_REVIEW_TEMPLATES.map(async (config) => {
      const [records, batches] = await Promise.all([
        listTemplateImageCandidatesByTemplate(config.templateKey),
        listTemplateImageBatchSummaries(config.templateKey),
      ]);

      return {
        batches,
        config,
        summary: buildTemplateReviewSummaryFromRecords({
          templateKey: config.templateKey,
          slotDefinitions: config.slotDefinitions,
          records,
        }),
      };
    })
  );

  return (
    <TemplateImageIndex
      items={items}
      notice={
        hasSupabaseAdminEnv()
          ? null
          : "Template image review is read-only in this environment until the Supabase admin variables are configured."
      }
    />
  );
}
