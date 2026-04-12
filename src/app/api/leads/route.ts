import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { Lead, LeadStatus } from "@/types/lead";

const updatableStatuses: LeadStatus[] = ["new", "generated", "emailed", "called", "closed"];

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: (data ?? []) as Lead[] });
}

export async function PATCH(request: Request) {
  const supabase = getSupabase();
  const body = (await request.json()) as {
    lead_id?: string;
    status?: LeadStatus;
  };

  if (!body.lead_id || !body.status || !updatableStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid lead update payload." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("leads")
    .update({ status: body.status })
    .eq("id", body.lead_id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead: data as Lead });
}
