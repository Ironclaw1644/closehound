import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Label } from "@/components/site/Label";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CloseHound collects, uses, and protects your data.",
  alternates: { canonical: "/legal/privacy" },
  robots: { index: true, follow: true },
};

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "What we collect",
    p: [
      "Account data: your email address and authentication details (handled by Supabase). Usage data: the markets and ZIPs you screen and your screen counts, so we can meter your plan. Billing data: subscription and purchase records (handled by Stripe — we never store full card numbers).",
    ],
  },
  {
    h: "How we use it",
    p: [
      "To operate the service: authenticate you, run and meter screens, deliver results, process payments, provide support, and improve the product. We do not sell your personal information.",
    ],
  },
  {
    h: "Third-party processors",
    p: [
      "We rely on trusted providers to run CloseHound: Supabase (auth + database), Stripe (payments), Resend (transactional email), Vercel (hosting), and licensed real-estate and HUD data providers for the underwriting data itself. Each processes data only as needed to provide its service.",
    ],
  },
  {
    h: "Cookies",
    p: [
      "We use only the cookies necessary to keep you signed in and run the app. We do not use advertising trackers.",
    ],
  },
  {
    h: "Your choices",
    p: [
      "You can access or delete your account data by contacting us. Closing your account removes your profile and saved deals. Cached market data is anonymous and not tied to you.",
    ],
  },
  {
    h: "Contact",
    p: ["Questions or data requests: walkperro@proton.me."],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <Label accent>LEGAL</Label>
        <h1 className="mt-4 font-display text-5xl">Privacy Policy</h1>
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
