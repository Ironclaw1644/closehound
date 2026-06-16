import type { Metadata } from "next";
import { HomeView } from "@/components/views/HomeView";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: languageAlternates("/") },
};

export default function HomePage() {
  return <HomeView locale="en" />;
}
