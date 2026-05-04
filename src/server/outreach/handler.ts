import "server-only";

import { OutreachError, sendOutreachToLead } from "@/lib/outreach/send";
import type { JobLogEntry, OutreachEmailJobPayload, OutreachEmailJobResult } from "@/types/operator";

type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
  entries: JobLogEntry[];
};

function asPayload(payload: unknown): OutreachEmailJobPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("outreach_email payload must be an object.");
  }
  const p = payload as Partial<OutreachEmailJobPayload>;
  if (!p.leadId) throw new Error("outreach_email payload missing leadId.");
  return { leadId: p.leadId, recipient: p.recipient };
}

export async function runOutreachEmailJob(
  payload: unknown,
  logger: Logger
): Promise<OutreachEmailJobResult> {
  const { leadId } = asPayload(payload);
  logger.info(`Sending outreach email for lead ${leadId}.`);
  try {
    const result = await sendOutreachToLead(leadId);
    logger.info(`Sent ${result.messageId ?? "(no id)"} to ${result.recipient}.`);
    return result;
  } catch (err) {
    if (err instanceof OutreachError) {
      throw new Error(`outreach failed (${err.status}): ${err.message}`);
    }
    throw err;
  }
}
