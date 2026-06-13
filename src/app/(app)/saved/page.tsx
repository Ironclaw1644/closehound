import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { SavedList } from "@/components/saved/SavedList";
import { Logo } from "@/components/site/Logo";
import { Label } from "@/components/site/Label";

export const metadata = { title: "Saved deals" };
export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/saved");
  return (
    <div className="min-h-screen">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-6">
          <Link href="/" aria-label="CloseHound home"><Logo /></Link>
          <Link href="/screen" className="text-sm text-muted-foreground transition hover:text-foreground">
            ← Screener
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <Label accent>SAVED</Label>
        <h1 className="mt-3 font-display text-4xl">Your saved deals</h1>
        <div className="mt-6">
          <SavedList />
        </div>
      </main>
    </div>
  );
}
