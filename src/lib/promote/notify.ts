import "server-only";

import { getResendClient, getOutboundSender } from "@/lib/resend";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { getNotifyPurchasesTo } from "@/lib/stripe/pricing";

type NotifyArgs = {
  purchaseId: string;
};

export type NotifyResult = {
  notified: boolean;
  channel: "email" | "log";
};

// In V1 the promote_site handler doesn't deploy anything yet — it just gets
// you to the customer fast so you can fulfill manually for the first 5-10
// sales while the failure modes shake out.
export async function notifyPurchaseReadyForFulfillment({
  purchaseId,
}: NotifyArgs): Promise<NotifyResult> {
  const supabase = getSupabaseAdminClient();
  const closehound = supabase.schema("closehound");

  const { data: purchase, error } = await closehound
    .from("purchases")
    .select("*")
    .eq("id", purchaseId)
    .maybeSingle();

  if (error || !purchase) {
    throw new Error(error?.message ?? "Purchase not found.");
  }

  const { data: lead } = await closehound
    .from("leads")
    .select("company_name, city, contact_email, phone, preview_url")
    .eq("id", purchase.lead_id)
    .maybeSingle();

  const to = getNotifyPurchasesTo();
  const subject = `[CloseHound] sale: ${lead?.company_name ?? "(unknown)"} — $${(purchase.amount_cents / 100).toFixed(2)}`;
  const lines = [
    `New sale recorded.`,
    ``,
    `Lead: ${lead?.company_name ?? purchase.lead_id}`,
    `City: ${lead?.city ?? "-"}`,
    `Customer email: ${purchase.customer_email ?? lead?.contact_email ?? "-"}`,
    `Customer phone: ${lead?.phone ?? "-"}`,
    `Stripe session: ${purchase.stripe_session_id ?? "-"}`,
    `Amount: $${(purchase.amount_cents / 100).toFixed(2)} ${purchase.currency.toUpperCase()}`,
    ``,
    `Preview: ${lead?.preview_url ?? "(not set)"}`,
    ``,
    `Next: collect domain preference and 4 setup answers, then promote to Vercel manually.`,
  ];
  const body = lines.join("\n");

  if (!to) {
    console.info("[promote:notify]", subject, "\n", body);
    return { notified: false, channel: "log" };
  }

  const result = await getResendClient().emails.send({
    from: getOutboundSender(),
    to,
    subject,
    text: body,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { notified: true, channel: "email" };
}
