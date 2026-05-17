import "server-only";

import { notifyPurchaseReadyForFulfillment } from "@/lib/promote/notify";
import type { JobLogEntry, PromoteSiteJobPayload, PromoteSiteJobResult } from "@/types/operator";

type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
  entries: JobLogEntry[];
};

function asPayload(payload: unknown): PromoteSiteJobPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("promote_site payload must be an object.");
  }
  const p = payload as Partial<PromoteSiteJobPayload>;
  if (!p.purchaseId) throw new Error("promote_site payload missing purchaseId.");
  return { purchaseId: p.purchaseId };
}

export async function runPromoteSiteJob(
  payload: unknown,
  logger: Logger
): Promise<PromoteSiteJobResult> {
  const { purchaseId } = asPayload(payload);
  logger.info(`Promote site requested for purchase ${purchaseId}.`);
  const result = await notifyPurchaseReadyForFulfillment({ purchaseId });
  logger.info(`Notify channel: ${result.channel}, sent: ${result.notified}.`);
  return {
    purchaseId,
    notified: result.notified,
    channel: result.channel,
  };
}
