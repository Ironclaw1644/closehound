import { NextResponse } from "next/server";
import { resolveClaimAuth } from "@/lib/onboarding/session";
import { uploadCustomerPhoto } from "@/lib/onboarding/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;
  const payload = await resolveClaimAuth(token);
  if (!payload) {
    return NextResponse.json(
      { ok: false, error: "Session expired." },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const slotRaw = formData.get("slot");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "No file provided." },
      { status: 400 }
    );
  }
  const slot = Number(slotRaw);
  if (!Number.isInteger(slot) || slot < 0 || slot > 4) {
    return NextResponse.json(
      { ok: false, error: "Invalid slot index." },
      { status: 400 }
    );
  }

  const result = await uploadCustomerPhoto({
    previewSiteId: payload.previewSiteId,
    slot,
    file,
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
