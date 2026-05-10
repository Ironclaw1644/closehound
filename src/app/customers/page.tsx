import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { hasSupabaseAdminEnv } from "@/lib/supabase";
import { listCustomers, type CustomerRow } from "@/lib/onboarding/storage";
import { CustomersConsole } from "@/components/dashboard/CustomersConsole";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customers · CloseHound",
  robots: { index: false, follow: false },
};

export default async function CustomersPage() {
  const configured = hasSupabaseAdminEnv();
  let customers: CustomerRow[] = [];
  let error: string | null = null;
  if (configured) {
    try {
      customers = await listCustomers();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load customers.";
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[color:var(--op-border)] bg-[color:var(--op-bg)]/95 px-4 py-2.5 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[color:var(--op-text-muted)] hover:text-[color:var(--op-text)]"
            aria-label="Back to leads"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
            <span className="text-xs">Leads</span>
          </Link>
          <span className="mx-1 text-[color:var(--op-text-subtle)]">·</span>
          <span className="text-sm font-semibold tracking-tight">closehound</span>
          <span className="ml-2 rounded-full border border-[color:var(--op-border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[color:var(--op-text-muted)]">
            Customers
          </span>
        </div>
      </header>

      {!configured ? (
        <EmptyState
          title="Supabase service-role key missing"
          body="Add SUPABASE_SECRET_KEY to .env.local to view customers."
        />
      ) : error ? (
        <div className="m-6 rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : (
        <CustomersConsole initial={customers} />
      )}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-[color:var(--op-border)] bg-[color:var(--op-panel)] p-6 text-center">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-xs leading-5 text-[color:var(--op-text-muted)]">{body}</p>
    </div>
  );
}
