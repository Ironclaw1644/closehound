import { LeadConsole } from "@/components/dashboard/LeadConsole";
import { hasSupabaseAdminEnv, getSupabaseAdminClient } from "@/lib/supabase";
import type { Lead } from "@/types/lead";
import type { Job } from "@/types/operator";

export const dynamic = "force-dynamic";

async function loadInitialState(): Promise<{
  leads: Lead[];
  jobs: Job[];
  configured: boolean;
}> {
  if (!hasSupabaseAdminEnv()) {
    return { leads: [], jobs: [], configured: false };
  }

  const closehound = getSupabaseAdminClient().schema("closehound");

  const [leadsResult, jobsResult] = await Promise.all([
    closehound
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
    closehound
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return {
    leads: ((leadsResult.data ?? []) as Lead[]),
    jobs: ((jobsResult.data ?? []) as Job[]),
    configured: true,
  };
}

export default async function DashboardPage() {
  const { leads, jobs, configured } = await loadInitialState();

  return <LeadConsole initialLeads={leads} initialJobs={jobs} configured={configured} />;
}
