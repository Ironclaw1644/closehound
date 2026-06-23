import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

// The /guide playbook — English-only, dark editorial marketing surface (outside
// the (app) light group, like /markets). Educational content, not legal advice.
export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="en" />
      {children}
      <Footer locale="en" />
    </>
  );
}
