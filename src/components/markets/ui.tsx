import Link from "next/link";
import { GradeBadge } from "@/components/site/GradeBadge";
import { usdMo, type VoucherRow } from "@/lib/markets/seo";

/** Inject one or more JSON-LD objects as a single <script>. */
export function JsonLd({ data }: { data: unknown[] }) {
  const payload = data.length === 1 ? data[0] : data;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

export function Breadcrumbs({ items }: { items: Array<{ name: string; path: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      {items.map((it, i) => (
        <span key={it.path} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-hairline">/</span>}
          {i < items.length - 1 ? (
            <Link href={it.path} className="transition hover:text-foreground">
              {it.name}
            </Link>
          ) : (
            <span className="text-foreground">{it.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Real HUD SAFMR voucher rents (2–4 bed) by ZIP for one market. */
export function VoucherTable({ rows }: { rows: VoucherRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-hairline">
      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="border-b border-hairline bg-surface-1 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 font-medium">ZIP code</th>
            <th className="px-4 py-3 text-right font-medium">2-bed</th>
            <th className="px-4 py-3 text-right font-medium">3-bed</th>
            <th className="px-4 py-3 text-right font-medium">4-bed</th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          {rows.map((r, i) => (
            <tr key={r.zip} className={i % 2 ? "bg-surface-1/40" : ""}>
              <td className="px-4 py-2.5 text-foreground">{r.zip}</td>
              <td className="px-4 py-2.5 text-right text-muted-foreground">{usdMo(r.br2)}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-foreground">{usdMo(r.br3)}</td>
              <td className="px-4 py-2.5 text-right text-muted-foreground">{usdMo(r.br4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FaqBlock({ faqs }: { faqs: Array<{ q: string; a: string }> }) {
  return (
    <div className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline">
      {faqs.map((f) => (
        <details key={f.q} className="group px-5 py-4 open:bg-surface-1/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="text-muted-foreground transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** A linked market chip used in state/hub lists. */
export function MarketRow({
  href,
  city,
  sub,
  grade,
  voucher,
}: {
  href: string;
  city: string;
  sub: string;
  grade: import("@/lib/config/assumptions").Grade;
  voucher: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-surface-1/60"
    >
      <span className="flex items-center gap-3">
        <GradeBadge grade={grade} />
        <span className="min-w-0">
          <span className="block truncate font-medium text-foreground">{city}</span>
          <span className="block truncate text-xs text-muted-foreground">{sub}</span>
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-mono text-sm tabular-nums text-foreground">{voucher}</span>
        <span className="block text-[11px] text-muted-foreground">3-bed voucher</span>
      </span>
    </Link>
  );
}

export function CtaBand({
  title,
  sub,
  href = "/screen",
  cta = "Screen free →",
}: {
  title: string;
  sub: string;
  href?: string;
  cta?: string;
}) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
      <div className="glow-radial relative overflow-hidden rounded-2xl border border-gold/25 bg-surface-1 px-6 py-10 text-center sm:px-12">
        <h2 className="font-display text-3xl sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{sub}</p>
        <Link
          href={href}
          className="mt-7 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
        >
          {cta}
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">100 free credits · ~10 markets · no card</p>
      </div>
    </section>
  );
}
