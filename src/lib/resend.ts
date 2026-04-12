import "server-only";

import { Resend } from "resend";

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
  return `${getOutboundSenderName()} <${getOutboundFromAddress()}>`;
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
