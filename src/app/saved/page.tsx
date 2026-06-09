import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { SavedList } from "@/components/saved/SavedList";

export const metadata = { title: "Saved deals" };
export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/saved");
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Saved deals</h1>
        <a href="/screen" className="text-sm text-muted-foreground hover:text-foreground">
          ← Screener
        </a>
      </div>
      <SavedList />
    </main>
  );
}
