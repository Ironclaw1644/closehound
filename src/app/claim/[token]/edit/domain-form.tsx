"use client";
import { useState, useTransition } from "react";

type DomainStatus =
  | { kind: "configured"; domain: string; verification?: VerificationHints | null }
  | { kind: "pending"; domain: string }
  | { kind: "none" };

type VerificationHints = {
  type: string;
  domain: string;
  value: string;
  reason?: string;
} | null;

export function DomainForm({
  token,
  defaultUrl,
  initialDomain,
  initialStatus,
  saveAction,
}: {
  token: string;
  defaultUrl: string;
  initialDomain: string | null;
  initialStatus: { verification?: VerificationHints | null } | null;
  saveAction: (token: string, formData: FormData) => Promise<void>;
}) {
  const [domain, setDomain] = useState(initialDomain ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function isValidDomain(value: string): boolean {
    // Permissive but real: must be host.tld with valid characters, no scheme.
    return /^(?!-)([a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,}$/i.test(value.trim());
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = domain.trim().toLowerCase();
    if (trimmed && !isValidDomain(trimmed)) {
      setError("That doesn't look like a valid domain (e.g. tomspaint.com).");
      return;
    }
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveAction(token, fd);
    });
  }

  function handleClear(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setError(null);
    setDomain("");
    const fd = new FormData();
    fd.set("domain", "");
    startTransition(async () => {
      await saveAction(token, fd);
    });
  }

  const verification = initialStatus?.verification ?? null;

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-white p-8 ring-1 ring-black/10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Domain</h2>
        <p className="mt-2 text-sm text-[#6b6b6b]">
          Pick where customers find your site. Default is free; bring your own domain anytime.
        </p>
      </div>

      {/* Card 1 — default subdomain */}
      <div
        className="rounded-2xl p-5 ring-1 ring-black/10"
        style={{ background: "#f5f1e8" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b6b6b]">
          Default URL · Free
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="font-mono text-[15px] text-[#0e0e0e]">{defaultUrl}</p>
          <CopyButton value={defaultUrl} />
        </div>
        <p className="mt-2 text-xs text-[#6b6b6b]">
          Live the moment you publish. No DNS setup needed.
        </p>
      </div>

      {/* Card 2 — bring your own */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-5 ring-1 ring-black/10"
        style={{ background: "#ffffff" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b6b6b]">
          Bring your own domain
        </p>
        <p className="mt-1 text-sm text-[#3a3a3a]">
          Got a domain? Drop it in. We'll show DNS instructions and attach it to your site once you publish.
        </p>

        <label className="mt-4 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b6b6b]">
            Your domain
          </span>
          <input
            type="text"
            name="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="tomspaint.com"
            autoComplete="off"
            spellCheck={false}
            className="rounded-xl bg-[#f5f1e8] px-4 py-3 font-mono text-base ring-1 ring-black/10 outline-none transition focus:ring-2 focus:ring-[#ebff00]"
          />
        </label>

        {error ? (
          <p className="mt-2 text-xs text-[#7a2222]">{error}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-full bg-[#0e0e0e] px-5 py-2.5 text-sm font-semibold text-[#ebff00] transition hover:-translate-y-0.5 hover:bg-[#2a2a2a] disabled:cursor-default disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          {initialDomain ? (
            <button
              type="button"
              onClick={handleClear}
              disabled={pending}
              className="text-sm text-[#6b6b6b] underline underline-offset-4 transition hover:text-[#0e0e0e]"
            >
              Remove custom domain
            </button>
          ) : null}
          <a
            href={`https://www.godaddy.com/domains/searchresults.aspx?checkAvail=1&domainToCheck=${encodeURIComponent(domain || "yourbusiness")}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-sm text-[#3a3a3a] underline underline-offset-4 transition hover:text-[#0e0e0e]"
          >
            Don't have one? Search GoDaddy ↗
          </a>
        </div>
      </form>

      {/* Card 3 — DNS instructions when a domain is saved */}
      {initialDomain ? (
        <div
          className="rounded-2xl p-5 ring-1 ring-black/10"
          style={{ background: "#0e0e0e", color: "#f5f1e8" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ebff00]">
            DNS for {initialDomain}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#f5f1e8]/80">
            At your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.),
            update DNS to point your domain at Vercel:
          </p>
          <DnsRecordList domain={initialDomain} />
          {verification ? (
            <div className="mt-5 rounded-xl bg-white/5 px-4 py-3 text-xs leading-5">
              <p className="font-semibold uppercase tracking-[0.18em] text-[#ebff00]">
                Vercel verification
              </p>
              <p className="mt-2 font-mono">
                Type: {verification.type} <br />
                Domain: {verification.domain} <br />
                Value: <span className="break-all">{verification.value}</span>
              </p>
              {verification.reason ? (
                <p className="mt-2 text-[#f5f1e8]/70">{verification.reason}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-xs leading-5 text-[#f5f1e8]/70">
              After updating DNS, click <strong>Publish</strong>. We'll attach the
              domain to Vercel and Google will start indexing it within a day.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function DnsRecordList({ domain }: { domain: string }) {
  const apex = !/^[^.]+\..+\..+$/.test(domain) || domain.split(".").length === 2;
  const rows = apex
    ? [
        { type: "A", host: "@", value: "76.76.21.21" },
        { type: "CNAME", host: "www", value: "cname.vercel-dns.com" },
      ]
    : [
        {
          type: "CNAME",
          host: domain.split(".")[0],
          value: "cname.vercel-dns.com",
        },
      ];

  return (
    <table className="mt-3 w-full text-left font-mono text-sm">
      <thead>
        <tr className="text-[10px] uppercase tracking-[0.18em] text-[#f5f1e8]/55">
          <th className="px-2 py-1">Type</th>
          <th className="px-2 py-1">Host</th>
          <th className="px-2 py-1">Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={`${r.type}-${r.host}`} className="border-t border-white/10">
            <td className="px-2 py-1.5 text-[#ebff00]">{r.type}</td>
            <td className="px-2 py-1.5">{r.host}</td>
            <td className="px-2 py-1.5 break-all">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // ignore
        }
      }}
      className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
