/**
 * App (data-first) surface — /screen, /account, /saved.
 *
 * The `data-surface="light"` attribute scopes the light token block defined in
 * globals.css to everything under this route group. Marketing routes (/, /demo,
 * /pricing, /how-it-works, /legal, /login) stay on the dark `:root` tokens.
 * Route groups are URL-transparent, so the paths are unchanged.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-surface="light" className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
