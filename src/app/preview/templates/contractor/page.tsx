import Link from "next/link";

import { CONTRACTOR_SITE_EXAMPLES } from "@/lib/site-templates/contractor";

export default function ContractorTemplateIndexPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
          CloseHound Templates
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Contractor website template previews
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-300">
          This route lists the seeded contractor examples built from reusable preset data and
          business-specific overrides.
        </p>

        <div className="mt-10 grid gap-4">
          {CONTRACTOR_SITE_EXAMPLES.map((example) => (
            <Link
              key={example.key}
              href={`/preview/templates/contractor/${example.key}`}
              className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 transition hover:border-white/20 hover:bg-white/8"
            >
              <p className="text-xl font-semibold text-white">{example.label}</p>
              <p className="mt-2 text-sm leading-7 text-zinc-300">{example.description}</p>
              <p className="mt-4 text-sm font-medium text-orange-300">
                Open preview: /preview/templates/contractor/{example.key}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
