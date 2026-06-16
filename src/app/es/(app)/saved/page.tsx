import { SavedView } from "@/components/views/SavedView";

export const metadata = { title: "Guardados" };
export const dynamic = "force-dynamic";

export default function SavedPageEs() {
  return <SavedView locale="es" />;
}
