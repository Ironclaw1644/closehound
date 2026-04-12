import LeadsTable from "@/components/leads-table";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import type { Lead } from "@/types/lead";

export const dynamic = "force-dynamic";

async function getLeads(): Promise<Lead[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .schema("closehound")
    .from("leads")
    .select(
      "id, company_name, contact_email, phone, city, industry, rating, has_website, status, preview_url, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load closehound.leads: ${error.message}`);
  }

  return (data ?? []) as Lead[];
}

export default async function DashboardPage() {
  const leads = await getLeads();
  const isSupabaseConfigured = hasSupabaseEnv();

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-[30px] border border-white/10 bg-black/30 p-8 shadow-[0_20px_100px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-orange-200/70">
                CloseHound Dashboard
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Premium lead review, stripped to essentials.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
                Pulling directly from the <span className="text-zinc-200">closehound.leads</span>{" "}
                schema with a minimal table built for preview generation and the first working
                outbound email flow.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Total</p>
                <p className="mt-2 text-3xl font-semibold text-white">{leads.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Needs Site</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {leads.filter((lead) => !lead.has_website).length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Contacted</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {
                    leads.filter(
                      (lead) =>
                        lead.status === "emailed" ||
                        lead.status === "called" ||
                        lead.status === "closed"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        {!isSupabaseConfigured ? (
          <section className="rounded-[26px] border border-amber-300/15 bg-amber-300/8 px-6 py-4 text-sm text-amber-100">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code> to load data
            from <code>closehound.leads</code>.
          </section>
        ) : null}

        <section className="rounded-[30px] border border-white/10 bg-zinc-950/80 p-3 shadow-[0_20px_100px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <LeadsTable leads={leads} />
        </section>
      </div>
    </main>
  );
}
