"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";

// Real (non-mailto) contact form for the customer-facing preview. Posts the
// fields to /api/preview/[slug]/contact, which Resend-emails the buyer. The
// previous version used `mailto:` which (a) failed silently when the visitor
// had no email client configured and (b) gave them zero feedback on whether
// the message was sent.

export type Palette = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentInk: string;
};

export function ContactForm({
  slug,
  businessName,
  palette,
}: {
  slug: string;
  businessName: string;
  palette: Palette;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "Please add your name.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Please add a valid email so they can reply.";
    }
    if (!message.trim()) return "Tell them a little about what you need.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const reason = validate();
    if (reason) {
      setError(reason);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/preview/${encodeURIComponent(slug)}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setError(body.error ?? "Couldn't send right now. Please call instead.");
        return;
      }
      setSent(true);
    } catch {
      setError("Couldn't reach the server. Please call instead.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div
        className="mt-6 flex flex-col items-start gap-3 rounded-2xl p-6"
        style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
        }}
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: `${palette.accent}22`, color: palette.accent }}
        >
          <FontAwesomeIcon icon={faCircleCheck} className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: palette.text }}>
          Message sent.
        </h3>
        <p className="text-sm leading-6" style={{ color: palette.textMuted }}>
          {businessName} will be in touch soon. If it's urgent, give them a call —
          most replies happen within an hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: palette.textMuted }}
        >
          Name
        </span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-xl px-4 py-3 text-[15px] outline-none transition focus:ring-2"
          style={{
            background: palette.background,
            border: `1px solid ${palette.border}`,
            color: palette.text,
          }}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: palette.textMuted }}
          >
            Phone
          </span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl px-4 py-3 text-[15px] outline-none transition focus:ring-2"
            style={{
              background: palette.background,
              border: `1px solid ${palette.border}`,
              color: palette.text,
            }}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: palette.textMuted }}
          >
            Email
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl px-4 py-3 text-[15px] outline-none transition focus:ring-2"
            style={{
              background: palette.background,
              border: `1px solid ${palette.border}`,
              color: palette.text,
            }}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: palette.textMuted }}
        >
          What can we help with?
        </span>
        <textarea
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="rounded-xl px-4 py-3 text-[15px] outline-none transition focus:ring-2"
          style={{
            background: palette.background,
            border: `1px solid ${palette.border}`,
            color: palette.text,
          }}
        />
      </label>

      {error ? (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-semibold tracking-tight transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-60 disabled:hover:translate-y-0"
        style={{
          background: palette.accent,
          color: palette.accentInk,
          boxShadow: `0 10px 24px ${palette.accent}33`,
        }}
      >
        {submitting ? (
          <>
            <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send"
        )}
      </button>
    </form>
  );
}
