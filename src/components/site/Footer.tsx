import Link from "next/link";
import { Logo } from "./Logo";
import { Label } from "./Label";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/screen", label: "Open the screener" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/how-it-works#zones", label: "Opportunity Zones" },
      { href: "/pricing", label: "Pricing" },
      { href: "/demo", label: "Watch the demo" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/how-it-works#methodology", label: "Our methodology" },
      { href: "/how-it-works#data", label: "Where the data comes from" },
      { href: "/how-it-works#faq", label: "FAQ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The deal screener for Section 8 investors. Built on official HUD voucher data —
              so you find the homes where the government check beats the mortgage.
            </p>
            <Label className="mt-6" gold>
              A WALKPERRO PRODUCT
            </Label>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <Label>{col.title}</Label>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-hairline pt-6">
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            CloseHound is an analytics tool, not a licensed real-estate brokerage, lender, or
            financial, investment, or legal advisor. Deal Scores are estimates generated from
            public HUD Fair Market Rent / SAFMR data and third-party listing and market data, and
            may be incomplete or out of date. Always verify rents, costs, and condition and consult
            a qualified professional before buying. CloseHound is not affiliated with, endorsed by,
            or sponsored by the U.S. Department of Housing and Urban Development.
          </p>
          <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-[12px] text-muted-foreground">
              © {new Date().getFullYear()} CloseHound · WalkPerro. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-[12px] text-muted-foreground">
              <Link href="/legal/terms" className="transition hover:text-foreground">Terms</Link>
              <Link href="/legal/privacy" className="transition hover:text-foreground">Privacy</Link>
              <a href="mailto:walkperro@proton.me" className="transition hover:text-foreground">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
