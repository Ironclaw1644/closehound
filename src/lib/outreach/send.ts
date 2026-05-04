import "server-only";

import { getResendClient, getOutboundSender, getTestRecipient } from "@/lib/resend";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { buildOutreachBody, buildOutreachSubject } from "@/lib/outreach/copy";
import { normalizePreviewUrl } from "@/lib/preview";
import type { Lead, LeadStatus } from "@/types/lead";

export type SendOutreachResult = {
  leadId: string;
  recipient: string;
  messageId: string | null;
};

export class OutreachError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getSenderFirstName() {
  return process.env.OUTBOUND_SENDER_FIRST_NAME?.trim() || "Casey";
}

function getSenderPhone(): string | null {
  return process.env.OUTBOUND_SENDER_PHONE?.trim() || null;
}

export async function sendOutreachToLead(leadId: string): Promise<SendOutreachResult> {
  const supabase = getSupabaseAdminClient();
  const closehound = supabase.schema("closehound");

  const { data, error } = await closehound
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (error || !data) {
    throw new OutreachError(error?.message ?? "Lead not found.", 404);
  }

  const lead = data as Lead;

  if (!lead.preview_url) {
    throw new OutreachError("Lead has no preview_url yet.", 409);
  }

  const recipient = lead.contact_email?.trim() || getTestRecipient();
  if (!recipient) {
    throw new OutreachError(
      "No contact_email on lead and OUTBOUND_TEST_RECIPIENT not set.",
      400
    );
  }

  const previewUrl = normalizePreviewUrl(lead.preview_url);

  const result = await getResendClient().emails.send({
    from: getOutboundSender(),
    to: recipient,
    subject: buildOutreachSubject(lead.company_name),
    text: buildOutreachBody({
      companyName: lead.company_name,
      city: lead.city,
      previewUrl,
      senderFirstName: getSenderFirstName(),
      senderPhone: getSenderPhone(),
    }),
  });

  if (result.error) {
    throw new OutreachError(result.error.message, 502);
  }

  const nextStatus: LeadStatus = "emailed";
  const { error: updateError } = await closehound
    .from("leads")
    .update({ status: nextStatus })
    .eq("id", lead.id);

  if (updateError) {
    throw new OutreachError(updateError.message, 500);
  }

  return {
    leadId: lead.id,
    recipient,
    messageId: result.data?.id ?? null,
  };
}
