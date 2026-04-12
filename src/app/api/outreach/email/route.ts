import { NextResponse } from "next/server";
import { getResendClient, getOutboundSender, getTestRecipient } from "@/lib/resend";
import { getSupabaseClient } from "@/lib/supabase";
import type { LeadStatus } from "@/types/lead";

type OutreachLeadRecord = {
  id: string;
  company_name: string;
  contact_email: string | null;
  preview_url: string | null;
  status: string;
};

function buildEmailSubject(companyName: string) {
  return `Quick idea for ${companyName}`;
}

function buildEmailText(companyName: string, previewUrl: string) {
  return [
    `Hi ${companyName} team,`,
    "",
    "I put together a quick website preview based on your current online presence.",
    "If useful, you can take a look here:",
    previewUrl,
    "",
    "No pressure at all. If it feels directionally helpful, I can refine it from there.",
    "",
    "Best,",
    "WalkPerro",
  ].join("\n");
}

export async function POST(request: Request) {
  const body = (await request.json()) as { leadId?: string };

  if (!body.leadId) {
    return NextResponse.json({ error: "leadId is required." }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .schema("closehound")
    .from("leads")
    .select("*")
    .eq("id", body.leadId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Lead not found." },
      { status: 404 }
    );
  }

  const lead = data as unknown as OutreachLeadRecord;

  if (!lead.preview_url) {
    return NextResponse.json(
      { error: "Lead is missing preview_url and cannot be emailed yet." },
      { status: 400 }
    );
  }

  const recipient = lead.contact_email?.trim() || getTestRecipient();

  if (!recipient) {
    return NextResponse.json(
      {
        error: "No contact_email found and OUTBOUND_TEST_RECIPIENT is not set.",
      },
      { status: 400 }
    );
  }

  try {
    const resend = getResendClient();
    const emailResult = await resend.emails.send({
      from: getOutboundSender(),
      to: recipient,
      subject: buildEmailSubject(lead.company_name),
      text: buildEmailText(lead.company_name, lead.preview_url),
    });

    if (emailResult.error) {
      return NextResponse.json({ error: emailResult.error.message }, { status: 502 });
    }

    const nextStatus: LeadStatus = "emailed";
    const { data: updatedLead, error: updateError } = await supabase
      .schema("closehound")
      .from("leads")
      .update({ status: nextStatus })
      .eq("id", lead.id)
      .select("status")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: emailResult.data?.id ?? null,
      status: updatedLead?.status ?? nextStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send outreach email.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
