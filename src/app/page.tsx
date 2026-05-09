import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {
  instrumentSerif,
  jetbrainsMono,
  geist,
} from "@/lib/preview/fonts";

// The same Next.js app is deployed to two hosts: closehound.com (operator
// console) and walkperro.com (buyer-facing marketing). Hitting `/` should:
//   - Show the public WalkPerro landing page when the request host is
//     walkperro.com (or any non-operator host — production custom domains,
//     preview deploys, etc.).
//   - Redirect to /dashboard when the request is on closehound.com or local
//     dev so the operator console stays one click from the root.
//
// Detected via the `Host` header read at request time. Forced to dynamic so
// the redirect path branches per-request.

export const dynamic = "force-dynamic";

const OPERATOR_HOST_RE =
  /^(?:closehound\.com|.+\.closehound\.com|localhost(?::\d+)?|127\.0\.0\.1(?::\d+)?)$/i;

const TEMPLATE_TILES: Array<{
  slug: string;
  label: string;
  blurb: string;
}> = [
  {
    slug: "handyman",
    label: "Handyman",
    blurb: "Drywall, doors, mounts. The trusted local fixer.",
  },
  {
    slug: "roofing",
    label: "Roofing",
    blurb: "Inspections, repairs, replacements. Storm-ready.",
  },
  {
    slug: "plumbing",
    label: "Plumbing",
    blurb: "Service calls, repairs, water heaters.",
  },
  {
    slug: "hvac",
    label: "HVAC",
    blurb: "Heating, cooling, indoor air. Same-day service.",
  },
  {
    slug: "dental",
    label: "Dental",
    blurb: "Hygiene, cosmetic, family dentistry.",
  },
  {
    slug: "landscaping",
    label: "Landscaping",
    blurb: "Mowing, design, install. Curb appeal that lasts.",
  },
];

const HOW_STEPS: Array<{
  step: string;
  title: string;
  body: string;
}> = [
  {
    step: "01",
    title: "We design your site",
    body:
      "We pull your business info from Google, hand-pick a template that fits your trade, and ship a private preview at walkperro.com/your-business — usually within 48 hours.",
  },
  {
    step: "02",
    title: "You customize it",
    body:
      "After purchase, you get a one-click claim link. Edit your phone, hours, services, photos, accent color — all from a simple editor. No code, no calls.",
  },
  {
    step: "03",
    title: "You go live",
    body:
      "Hit publish. We attach your domain (or you get walkperro.com/yourname free), wire SSL, and ping Google so you start ranking. Done.",
  },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "What's actually included for $497?",
    a:
      "A conversion-grade single-page website on your domain (or our subdomain), mobile-fast hosting, SSL, Google Business connection, copy and photo selection done for you, and a self-serve editor for life. One flat fee — no monthly hosting upcharges.",
  },
  {
    q: "How fast is this really?",
    a:
      "From the moment you pay, your site is live in under a week — most go live the same day once the buyer publishes. We've built the design, copy, and editor so the only thing standing between you and a live site is a few minutes of customizing.",
  },
  {
    q: "What if I already have a domain?",
    a:
      "Bring it. The editor's Domain tab handles both flows — point your existing domain to us, or pick a fresh one we suggest via GoDaddy. We attach it to Vercel automatically when you publish.",
  },
  {
    q: "What if I don't love the result?",
    a:
      "We refund. The whole point of giving you a preview before purchase is so you only pay if it's worth it. If you publish and change your mind in the first 14 days, email hello@walkperro.com and we'll handle it.",
  },
];

export default async function HomePage() {
  const hdrs = await headers();
  const rawHost = (hdrs.get("host") ?? "").split(":")[0].toLowerCase();
  const port = (hdrs.get("host") ?? "").includes(":")
    ? hdrs.get("host")!.split(":")[1]
    : "";
  const hostKey = port ? `${rawHost}:${port}` : rawHost;

  // Operator console hosts — redirect to /dashboard.
  if (OPERATOR_HOST_RE.test(hostKey)) {
    redirect("/dashboard");
  }

  // Everything else (walkperro.com, *.vercel.app preview deploys, custom
  // domains attached to a buyer's site somehow hitting root) gets the public
  // marketing landing.
  return (
    <main
      className={`${instrumentSerif.variable} ${jetbrainsMono.variable} ${geist.variable} min-h-screen bg-[#0E0E0E] text-[#F5F1E8]`}
      style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}
    >
      {/* ── Top nav ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#0E0E0E]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="WalkPerro home" className="flex items-center gap-2">
            <Image
              src="/walkperro/logo-wordmark-dark.png"
              alt="WalkPerro"
              width={180}
              height={40}
              priority
              className="h-8 w-auto"
            />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#how"
              className="text-[13px] font-medium text-[#F5F1E8]/70 transition hover:text-[#F5F1E8]"
            >
              How it works
            </a>
            <a
              href="#templates"
              className="text-[13px] font-medium text-[#F5F1E8]/70 transition hover:text-[#F5F1E8]"
            >
              Templates
            </a>
            <a
              href="#faq"
              className="text-[13px] font-medium text-[#F5F1E8]/70 transition hover:text-[#F5F1E8]"
            >
              FAQ
            </a>
          </nav>
          <a
            href="#templates"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#EBFF00] px-5 text-[13px] font-semibold text-[#0E0E0E] transition hover:-translate-y-0.5"
          >
            See examples
          </a>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(1200px 480px at 75% -10%, rgba(235,255,0,0.15), transparent 60%)",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex-1">
            <span
              className="inline-block rounded-full border border-[#EBFF00]/40 bg-[#EBFF00]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#EBFF00]"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              $497 · live in 7 days
            </span>
            <h1
              className="mt-5 text-[44px] font-normal leading-[1.05] tracking-tight sm:text-[64px]"
              style={{ fontFamily: "var(--font-instrument-serif), serif" }}
            >
              Conversion-grade websites
              <br />
              for service businesses.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-[#F5F1E8]/75 sm:text-[19px]">
              We design a high-converting site for your business, send you a
              private preview, and you only pay when it's right. Hosting, SSL,
              and Google Business connection included.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#templates"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#EBFF00] px-6 text-[14px] font-semibold text-[#0E0E0E] transition hover:-translate-y-0.5"
              >
                See live examples
              </a>
              <a
                href="#how"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 text-[14px] font-semibold text-[#F5F1E8] transition hover:bg-white/[0.08]"
              >
                How it works
              </a>
            </div>
            <p
              className="mt-6 text-[12px] uppercase tracking-[0.18em] text-[#F5F1E8]/45"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              No subscription · No hidden hosting fees · Refunds in 14 days
            </p>
          </div>
          <div className="flex-1">
            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EBFF00]"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                What's included
              </div>
              <ul className="mt-4 grid gap-3 text-[15px] leading-[1.55] text-[#F5F1E8]/85 sm:grid-cols-2">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#EBFF00]" />
                  <span>Custom design — pulled from your trade</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#EBFF00]" />
                  <span>Mobile-fast hosting + SSL</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#EBFF00]" />
                  <span>Edit it yourself — no developer needed</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#EBFF00]" />
                  <span>Your domain or ours — both supported</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#EBFF00]" />
                  <span>SEO + Google Business connection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#EBFF00]" />
                  <span>One flat fee. Forever yours.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section id="how" className="border-b border-white/[0.07]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EBFF00]"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              How it works
            </span>
            <h2
              className="mt-3 text-[36px] font-normal leading-[1.1] tracking-tight sm:text-[44px]"
              style={{ fontFamily: "var(--font-instrument-serif), serif" }}
            >
              Three steps. No project meetings.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {HOW_STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-[20px] border border-white/[0.08] bg-white/[0.025] p-7 transition hover:bg-white/[0.04] sm:p-8"
              >
                <span
                  className="text-[12px] font-semibold tracking-[0.18em] text-[#EBFF00]"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  {s.step}
                </span>
                <h3
                  className="mt-4 text-[24px] font-normal leading-[1.15]"
                  style={{ fontFamily: "var(--font-instrument-serif), serif" }}
                >
                  {s.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.6] text-[#F5F1E8]/70">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industry templates ─────────────────────────────── */}
      <section id="templates" className="border-b border-white/[0.07]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EBFF00]"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                Live templates
              </span>
              <h2
                className="mt-3 text-[36px] font-normal leading-[1.1] tracking-tight sm:text-[44px]"
                style={{ fontFamily: "var(--font-instrument-serif), serif" }}
              >
                Designed for your trade.
              </h2>
              <p className="mt-3 text-[15px] leading-[1.6] text-[#F5F1E8]/70">
                Click any template to see it live. We have 14 industry-specific
                designs, each tuned for what your buyers actually search for.
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_TILES.map((t) => (
              <Link
                key={t.slug}
                href={`/preview/templates/${t.slug}`}
                className="group flex flex-col justify-between rounded-[20px] border border-white/[0.08] bg-white/[0.025] p-7 transition hover:border-[#EBFF00]/30 hover:bg-white/[0.05]"
              >
                <div>
                  <h3
                    className="text-[26px] font-normal leading-[1.15]"
                    style={{ fontFamily: "var(--font-instrument-serif), serif" }}
                  >
                    {t.label}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.55] text-[#F5F1E8]/65">
                    {t.blurb}
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-[#EBFF00] transition group-hover:gap-3">
                  See live preview →
                </span>
              </Link>
            ))}
          </div>
          <p
            className="mt-8 text-center text-[12px] uppercase tracking-[0.2em] text-[#F5F1E8]/40"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            Plus pressure washing · med spa · junk removal · mobile detailing · painting · electrical · auto repair · pest control
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section id="faq" className="border-b border-white/[0.07]">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EBFF00]"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            FAQ
          </span>
          <h2
            className="mt-3 text-[36px] font-normal leading-[1.1] tracking-tight sm:text-[44px]"
            style={{ fontFamily: "var(--font-instrument-serif), serif" }}
          >
            Common questions.
          </h2>
          <dl className="mt-10 divide-y divide-white/[0.07]">
            {FAQ.map((item) => (
              <div key={item.q} className="py-6 first:pt-0">
                <dt
                  className="text-[19px] font-normal leading-[1.3] text-[#F5F1E8]"
                  style={{ fontFamily: "var(--font-instrument-serif), serif" }}
                >
                  {item.q}
                </dt>
                <dd className="mt-2.5 text-[15px] leading-[1.65] text-[#F5F1E8]/70">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="border-b border-white/[0.07]">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-24">
          <h2
            className="text-[40px] font-normal leading-[1.05] tracking-tight sm:text-[56px]"
            style={{ fontFamily: "var(--font-instrument-serif), serif" }}
          >
            Curious what yours would look like?
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-[1.55] text-[#F5F1E8]/75">
            We send a private preview before you ever pay. If it's not right,
            you owe nothing. If it is, you're live in days.
          </p>
          <a
            href="mailto:hello@walkperro.com?subject=Site%20preview%20request"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#EBFF00] px-7 text-[14px] font-semibold text-[#0E0E0E] transition hover:-translate-y-0.5"
          >
            Request a preview
          </a>
          <p
            className="mt-4 text-[11px] uppercase tracking-[0.2em] text-[#F5F1E8]/45"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            hello@walkperro.com
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer>
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-12 sm:flex-row sm:items-center sm:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/walkperro/logo-mark.png"
              alt="WalkPerro mark"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span
              className="text-[12px] uppercase tracking-[0.22em] text-[#F5F1E8]/55"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              WalkPerro · Built for operators
            </span>
          </div>
          <div
            className="text-[12px] uppercase tracking-[0.18em] text-[#F5F1E8]/40"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            © {new Date().getFullYear()} WalkPerro
          </div>
        </div>
      </footer>
    </main>
  );
}
