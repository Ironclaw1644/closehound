import "server-only";

import { Resend } from "resend";
import { isDemoMode } from "@/lib/env";

/** ALL outbound email goes through here. DEMO_MODE stubs the send to a
 *  console.log — the public demo must never email anyone. */
export async function sendEmail(opts: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<unknown> {
  if (isDemoMode()) {
    console.log(
      `[demo] outbound email stubbed — to: ${opts.to}, subject: ${opts.subject}`
    );
    return { data: { id: "demo-stub" }, error: null };
  }
  return getResendClient().emails.send(opts);
}

function getRequiredEnv(name: "RESEND_API_KEY" | "RESEND_FROM") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOutboundSenderName() {
  return process.env.OUTBOUND_SENDER_NAME?.trim() || "WalkPerro";
}

export function getOutboundFromAddress() {
  return getRequiredEnv("RESEND_FROM");
}

export function getOutboundSender() {
  // RESEND_FROM may be either a bare email ("hello@walkperro.com") OR a
  // full RFC-style "Name <email>" string ("WalkPerro <hello@walkperro.com>").
  // The walkperro repo's env var uses the full form; if we naively wrap it
  // again we produce "Name <Name <email>>" which Resend rejects with
  // "Invalid `from` field". Detect and pass through.
  const raw = getOutboundFromAddress().trim();
  if (raw.includes("<") && raw.includes(">") && raw.includes("@")) {
    return raw;
  }
  return `${getOutboundSenderName()} <${raw}>`;
}

export function getTestRecipient() {
  return process.env.OUTBOUND_TEST_RECIPIENT?.trim() || null;
}

let resendClient: Resend | undefined;

export function getResendClient() {
  if (resendClient) {
    return resendClient;
  }

  resendClient = new Resend(getRequiredEnv("RESEND_API_KEY"));

  return resendClient;
}
