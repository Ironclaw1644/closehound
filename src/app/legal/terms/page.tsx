import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Label } from "@/components/site/Label";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of CloseHound.",
  alternates: { canonical: "/legal/terms" },
  robots: { index: true, follow: true },
};

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. What CloseHound is",
    p: [
      "CloseHound is a software analytics tool that helps you research potential Section 8 (Housing Choice Voucher) rental investments by comparing HUD Fair Market Rent / SAFMR data and third-party listing and market data, and producing estimated underwriting metrics and a “Deal Score.”",
      "CloseHound is not a real-estate brokerage, lender, property manager, or financial, investment, tax, or legal advisor. Nothing CloseHound outputs is an offer, solicitation, recommendation, or advice to buy, sell, or finance any property.",
    ],
  },
  {
    h: "2. No reliance; verify everything",
    p: [
      "All figures are estimates generated from data that may be incomplete, delayed, or inaccurate. Voucher rents, payment standards, prices, taxes, insurance, and condition vary and change. You are solely responsible for independently verifying every number and consulting qualified professionals before making any decision.",
    ],
  },
  {
    h: "3. Accounts & acceptable use",
    p: [
      "You are responsible for your account and for keeping your credentials secure. You agree not to scrape, resell, or redistribute data obtained through the service, not to exceed or circumvent plan limits, and not to use the service for any unlawful purpose, including unlawful housing discrimination.",
    ],
  },
  {
    h: "4. Plans, screens & billing",
    p: [
      "Paid plans and pay-as-you-go credit packs are billed through Stripe. Subscriptions grant a monthly allotment of screens; credit packs add non-expiring screens used after your monthly allotment is exhausted. The service meters usage so you cannot incur charges beyond what you have purchased. Subscriptions renew until canceled; you can cancel anytime and manage billing through the customer portal. Except where required by law, payments are non-refundable.",
    ],
  },
  {
    h: "5. Data sources & trademarks",
    p: [
      "CloseHound uses public HUD data and licensed third-party data. CloseHound is not affiliated with, endorsed by, or sponsored by the U.S. Department of Housing and Urban Development or any listing provider. All trademarks are the property of their respective owners.",
    ],
  },
  {
    h: "6. No warranty; limitation of liability",
    p: [
      "The service is provided “as is” and “as available,” without warranties of any kind. To the maximum extent permitted by law, CloseHound and WalkPerro are not liable for any indirect, incidental, or consequential damages, or for any lost profits or investment losses, arising from your use of the service. Our total liability is limited to the amount you paid in the three months before the claim.",
    ],
  },
  {
    h: "7. Changes & contact",
    p: [
      "We may update these terms; continued use means you accept the changes. Questions: walkperro@proton.me.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <Label accent>LEGAL</Label>
        <h1 className="mt-4 font-display text-5xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated June 2026.</p>
        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold">{s.h}</h2>
              {s.p.map((para, i) => (
                <p key={i} className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{para}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
