import { notFound } from "next/navigation";

import { TemplateCopyDetail } from "@/components/template-copy/template-copy-detail";
import { getTemplateCopyReviewConfig } from "@/lib/template-system/copy-review/registry";
import {
  applyTemplateCopyReviewState,
  buildTemplateCopyReviewSummary,
  listTemplateCopyReviewState,
} from "@/lib/template-system/copy-review/repository";
import type { TemplateCopySlot } from "@/lib/template-system/copy-review/types";

export const dynamic = "force-dynamic";

function groupSlotsBySection(slots: readonly TemplateCopySlot[]) {
  const groups: Array<{ sectionKey: string; slots: TemplateCopySlot[] }> = [];
  const bySection = new Map<string, TemplateCopySlot[]>();

  for (const slot of slots) {
    if (!bySection.has(slot.sectionKey)) {
      const sectionSlots: TemplateCopySlot[] = [];
      bySection.set(slot.sectionKey, sectionSlots);
      groups.push({ sectionKey: slot.sectionKey, slots: sectionSlots });
    }

    bySection.get(slot.sectionKey)?.push(slot);
  }

  return groups;
}

export default async function TemplateCopyDetailPage({
  params,
}: {
  params: Promise<{ templateKey: string }>;
}) {
  const { templateKey } = await params;
  const config = getTemplateCopyReviewConfig(templateKey);

  if (!config) {
    notFound();
  }

  const inventory = config.buildInventory();
  const reviewState = await listTemplateCopyReviewState(config.templateKey);
  const slots = applyTemplateCopyReviewState({
    inventory,
    reviewState,
  });
  const summary = buildTemplateCopyReviewSummary({
    templateKey: config.templateKey,
    inventory,
    reviewState,
  });

  return (
    <TemplateCopyDetail
      familyKey={config.familyKey}
      groupedSlots={groupSlotsBySection(slots)}
      previewPath={config.previewPath}
      slots={slots}
      summary={summary}
      templateKey={config.templateKey}
      title={config.label}
    />
  );
}
