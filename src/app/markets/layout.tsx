import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

// The /markets tree is English-only, dark editorial marketing surface (it lives
// outside the (app) light group on purpose). Header/Footer wrap every page so
// the hub → state → city tree is internally linked from the global nav.
export default function MarketsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="en" />
      {children}
      <Footer locale="en" />
    </>
  );
}
