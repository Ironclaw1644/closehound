"use client";
import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Persist dashboard filters in the URL so the operator can share a filtered
// view via link and not lose state on refresh. Each filter has a string key
// in the query. Empty/default values are stripped to keep the URL clean.

export type FilterShape = Record<string, string | undefined>;

/**
 * Two-way binding between local React state and the URL search params.
 *
 * Usage:
 *   const { values, setFilter } = useUrlFilters(
 *     { industry: 'all', status: 'all', q: '' },
 *     { stripIfEqualToDefault: true }
 *   );
 *   <input value={values.q} onChange={e => setFilter('q', e.target.value)} />
 *
 * Reads on first paint and every time the URL changes. Writes via
 * router.replace (no history push) so back/forward doesn't pile up entries.
 */
export function useUrlFilters<T extends FilterShape>(
  defaults: T,
  opts: { stripIfEqualToDefault?: boolean } = {}
) {
  const router = useRouter();
  const search = useSearchParams();

  // Derive current values from the URL, falling back to defaults.
  const values = useMemo(() => {
    const out: Record<string, string> = {};
    for (const key of Object.keys(defaults)) {
      const v = search.get(key);
      out[key] = v ?? defaults[key] ?? "";
    }
    return out as { [K in keyof T]: string };
  }, [search, defaults]);

  // Push a single filter change up to the URL.
  const setFilter = (key: keyof T & string, value: string) => {
    const params = new URLSearchParams(search.toString());
    const def = defaults[key] ?? "";
    const isDefault = opts.stripIfEqualToDefault !== false && value === def;
    if (!value || isDefault) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  const setMany = (patch: Partial<{ [K in keyof T]: string }>) => {
    const params = new URLSearchParams(search.toString());
    for (const [key, value] of Object.entries(patch)) {
      const def = (defaults as Record<string, string | undefined>)[key] ?? "";
      const isDefault = opts.stripIfEqualToDefault !== false && value === def;
      if (!value || isDefault) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  const clear = () => {
    router.replace("?", { scroll: false });
  };

  // No-op effect kept to satisfy strict typings against unused parts.
  useEffect(() => {}, []);

  return { values, setFilter, setMany, clear };
}
