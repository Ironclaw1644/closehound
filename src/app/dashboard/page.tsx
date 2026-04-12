import LeadsTable from "@/components/leads-table";
import { getSupabase, hasSupabaseEnv } from "@/lib/supabase";
import type { Lead } from "@/types/lead";

async function getLeads(): Promise<Lead[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }

  return (data ?? []) as Lead[];
}

export default async function DashboardPage() {
  const leads = await getLeads();
  const isSupabaseConfigured = hasSupabaseEnv();
  const totalLeads = leads.length;
  const generatedLeads = leads.filter((lead) => lead.status === "generated").length;
  const contactedLeads = leads.filter((lead) =>
    lead.status === "emailed" || lead.status === "called" || lead.status === "closed"
  ).length;

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-orange-200/70">
                CloseHound
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Leads worth closing, without the clutter.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
                Review fresh leads, generate a preview site, and move each account through
                outreach without leaving the dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Leads</p>
                <p className="mt-2 text-3xl font-semibold text-white">{totalLeads}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Generated</p>
                <p className="mt-2 text-3xl font-semibold text-white">{generatedLeads}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Contacted</p>
                <p className="mt-2 text-3xl font-semibold text-white">{contactedLeads}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-zinc-950/75 p-3 shadow-[0_20px_100px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          {!isSupabaseConfigured ? (
            <div className="rounded-[28px] border border-amber-300/15 bg-amber-300/8 px-6 py-4 text-sm text-amber-100">
              Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
              to load live leads from Supabase.
            </div>
          ) : null}
          <LeadsTable initialLeads={leads} />
        </section>
      </div>
    </main>
  );
}
