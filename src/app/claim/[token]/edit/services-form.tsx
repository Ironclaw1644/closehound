"use client";

import { useEffect, useRef, useState } from "react";
import { saveServicesAction } from "./actions";

// Hard cap matching the action's loop in actions.ts. Keeps form posts bounded
// and prevents accidental abuse — 10 services is more than any local-services
// site needs anyway.
const MAX_SERVICES = 10;

type Row = {
  title: string;
  body: string;
  price: string;
  // True for indexes < baseCount — those rows always render and fall back to
  // industry defaults when blank. False for buyer-added rows — those can be
  // removed and need a non-empty title to persist.
  isBase: boolean;
};

export function ServicesForm({
  token,
  baseItems,
  initialRows,
  industryDefaultPrices,
}: {
  token: string;
  baseItems: Array<{ title: string; body: string }>;
  // Combined: base rows (with overrides applied) followed by any buyer-added
  // rows beyond the base count. Length >= baseItems.length.
  initialRows: Array<{ title: string; body: string; price: string }>;
  // Per-index industry default price strings (e.g. "$189"), shown as
  // placeholder when the buyer hasn't set their own price.
  industryDefaultPrices: string[];
}) {
  const baseCount = baseItems.length;

  const [rows, setRows] = useState<Row[]>(() =>
    initialRows.map((r, i) => ({
      title: r.title,
      body: r.body,
      price: r.price,
      isBase: i < baseCount,
    }))
  );

  // Track whether the form state has diverged from what we mounted with so
  // we can fire a beforeunload prompt if the buyer tries to close the tab
  // with unsaved edits. We compare a JSON-serialized snapshot vs current
  // rows — same shape, easy to compare.
  const initialSnapshot = useRef(
    JSON.stringify(
      initialRows.map((r, i) => ({
        title: r.title,
        body: r.body,
        price: r.price,
        isBase: i < baseCount,
      }))
    )
  );
  const submittedRef = useRef(false);

  useEffect(() => {
    const dirty =
      !submittedRef.current && JSON.stringify(rows) !== initialSnapshot.current;
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Spec requires returnValue to be set for the prompt to fire in some
      // browsers. The browser shows its own generic message; our text is
      // ignored, but setting it is required.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [rows]);

  const updateRow = (i: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const removeRow = (i: number) => {
    // Confirm before destroying the row — buyer-added services have real
    // copy in them and removing is one-click destructive. Save still has to
    // run to persist the removal, so reverting before save is free too.
    const title = rows[i]?.title?.trim();
    const confirmed = window.confirm(
      title
        ? `Remove "${title}"? You can re-add it anytime.`
        : "Remove this service?"
    );
    if (!confirmed) return;
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addRow = () => {
    if (rows.length >= MAX_SERVICES) return;
    setRows((prev) => [
      ...prev,
      { title: "", body: "", price: "", isBase: false },
    ]);
  };

  return (
    <form
      action={saveServicesAction.bind(null, token)}
      onSubmit={() => {
        // Submitting the form → server action redirects to ?saved=services
        // → we don't want the beforeunload prompt to fire during that
        // navigation.
        submittedRef.current = true;
      }}
      className="flex flex-col gap-6 rounded-3xl bg-white p-8 ring-1 ring-black/10"
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Services</h2>
        <p className="mt-2 text-sm text-[#6b6b6b]">
          What you do, in your words. Each service has its own page on your
          site (e.g.{" "}
          <span className="font-mono text-[13px]">
            /services/drywall-doors-trim
          </span>
          ), plus a card on the home page. Leave a field blank to keep our
          default copy.
        </p>
      </div>

      {rows.map((row, i) => {
        const baseTitle = i < baseCount ? baseItems[i].title : "";
        const baseBody = i < baseCount ? baseItems[i].body : "";
        const defaultPrice = industryDefaultPrices[i] ?? "";
        return (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl bg-[#f5f1e8] p-5 ring-1 ring-black/5"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b6b6b]">
                {row.isBase ? `Service ${i + 1}` : `Service ${i + 1} · Added by you`}
              </p>
              {!row.isBase ? (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="text-xs font-semibold text-[#6b6b6b] underline-offset-4 transition hover:text-[#0e0e0e] hover:underline"
                >
                  Remove
                </button>
              ) : null}
            </div>

            <ClientField
              label="Title"
              name={`services[${i}][title]`}
              value={row.title}
              onChange={(v) => updateRow(i, { title: v })}
              placeholder={baseTitle || "e.g. Whole-home rewire"}
            />
            <ClientTextarea
              label="Description"
              name={`services[${i}][body]`}
              value={row.body}
              onChange={(v) => updateRow(i, { body: v })}
              rows={4}
              placeholder={
                baseBody ||
                "2-4 sentences. What's included, who it's for, why someone would book this."
              }
            />
            <ClientField
              label="Price label (optional)"
              name={`services[${i}][price]`}
              value={row.price}
              onChange={(v) => updateRow(i, { price: v })}
              placeholder={defaultPrice || "$199 / visit"}
              helperText={
                defaultPrice && !row.price
                  ? `Default: ${defaultPrice}`
                  : !row.isBase && !row.price
                    ? "Set a price so visitors know what to expect."
                    : undefined
              }
            />
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_SERVICES}
          className="inline-flex items-center justify-center rounded-full border border-dashed border-black/30 px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-black/60 disabled:cursor-default disabled:opacity-40 disabled:hover:translate-y-0"
        >
          + Add another service
        </button>
        {rows.length >= MAX_SERVICES ? (
          <span className="text-xs text-[#6b6b6b]">
            {MAX_SERVICES}-service limit reached.
          </span>
        ) : null}
      </div>

      <button
        type="submit"
        className="mt-2 inline-flex items-center justify-center self-start rounded-full bg-[#0e0e0e] px-6 py-3 text-sm font-semibold text-[#ebff00] transition hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
      >
        Save changes
      </button>
    </form>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Controlled form primitives — same look as Field/TextareaField in page.tsx
// but value-driven so React state can drive add/remove behavior.
// ───────────────────────────────────────────────────────────────────────────

function ClientField({
  label,
  name,
  value,
  onChange,
  placeholder,
  helperText,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helperText?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b6b6b]">
        {label}
      </span>
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl bg-white px-4 py-3 text-base ring-1 ring-black/10 outline-none transition focus:ring-2 focus:ring-[#ebff00]"
      />
      {helperText ? (
        <span className="text-[11px] text-[#6b6b6b]">{helperText}</span>
      ) : null}
    </label>
  );
}

function ClientTextarea({
  label,
  name,
  value,
  onChange,
  rows = 5,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b6b6b]">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="resize-y rounded-xl bg-white px-4 py-3 text-base leading-7 ring-1 ring-black/10 outline-none transition focus:ring-2 focus:ring-[#ebff00]"
      />
    </label>
  );
}
