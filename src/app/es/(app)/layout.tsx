/** Spanish app surface (/es/screen, /es/account, /es/saved) — light, like the
 *  English (app) group. Nested inside the /es layout's lang="es" wrapper. */
export default function EsAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-surface="light" className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
