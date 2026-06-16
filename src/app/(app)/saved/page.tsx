import { SavedView } from "@/components/views/SavedView";

export const metadata = { title: "Saved deals" };
export const dynamic = "force-dynamic";

export default function SavedPage() {
  return <SavedView locale="en" />;
}
