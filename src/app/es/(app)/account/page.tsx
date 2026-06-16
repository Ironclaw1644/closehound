import { AccountView } from "@/components/views/AccountView";

export const metadata = { title: "Cuenta" };
export const dynamic = "force-dynamic";

export default async function AccountPageEs({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; credits?: string }>;
}) {
  return <AccountView locale="es" searchParams={searchParams} />;
}
