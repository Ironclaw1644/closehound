import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import type { Lead } from "@/types/lead";

function toPreviewSlug(companyName: string) {
  return companyName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  const supabase = getSupabaseClient();
  const body = (await request.json()) as { lead_id?: string };

  if (!body.lead_id) {
    return NextResponse.json({ error: "lead_id is required." }, { status: 400 });
  }

  const { data: lead, error: fetchError } = await supabase
    .schema("closehound")
    .from("leads")
    .select("*")
    .eq("id", body.lead_id)
    .single();

  if (fetchError || !lead) {
    return NextResponse.json(
      { error: fetchError?.message ?? "Lead not found." },
      { status: 404 }
    );
  }

  const previewUrl = `https://preview-${toPreviewSlug(lead.company_name)}.vercel.app`;

  const { data: updatedLead, error: updateError } = await supabase
    .schema("closehound")
    .from("leads")
    .update({
      status: "generated",
      preview_url: previewUrl,
    })
    .eq("id", body.lead_id)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ lead: updatedLead as Lead });
}
