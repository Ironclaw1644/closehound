import Link from "next/link";
import { Logo } from "./Logo";

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/how-it-works#zones", label: "Opportunity Zones" },
  { href: "/demo", label: "Demo" },
  { href: "/pricing", label: "Pricing" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline/80 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="CloseHound home" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[13.5px] font-medium text-muted-foreground transition hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden h-9 items-center rounded-md px-3 text-[13.5px] font-semibold text-muted-foreground transition hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/screen"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-[13.5px] font-semibold text-primary-foreground transition hover:brightness-95"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
