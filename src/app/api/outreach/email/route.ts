import { NextResponse } from "next/server";
import { OutreachError, sendOutreachToLead } from "@/lib/outreach/send";

export async function POST(request: Request) {
  const body = (await request.json()) as { leadId?: string };
  if (!body.leadId) {
    return NextResponse.json({ error: "leadId is required." }, { status: 400 });
  }

  try {
    const result = await sendOutreachToLead(body.leadId);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    if (err instanceof OutreachError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Failed to send outreach.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
