import { TemplateCopyIndex } from "@/components/template-copy/template-copy-index";
import { TEMPLATE_COPY_REVIEW_TEMPLATES } from "@/lib/template-system/copy-review/registry";
import {
  buildTemplateCopyReviewSummary,
  listTemplateCopyReviewState,
} from "@/lib/template-system/copy-review/repository";

export const dynamic = "force-dynamic";

export default async function TemplateCopyIndexPage() {
  const items = await Promise.all(
    TEMPLATE_COPY_REVIEW_TEMPLATES.map(async (config) => {
      const inventory = config.buildInventory();
      const reviewState = await listTemplateCopyReviewState(config.templateKey);
      const summary = buildTemplateCopyReviewSummary({
        templateKey: config.templateKey,
        inventory,
        reviewState,
      });

      return {
        templateKey: config.templateKey,
        familyKey: config.familyKey,
        label: config.label,
        previewPath: config.previewPath,
        summary,
      };
    })
  );

  return <TemplateCopyIndex items={items} />;
}
