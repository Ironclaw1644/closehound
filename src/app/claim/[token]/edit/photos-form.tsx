"use client";
import { useState } from "react";

const SLOTS = [
  { idx: 0, label: "Gallery photo 1", aspect: "4 / 5" },
  { idx: 1, label: "Gallery photo 2", aspect: "4 / 5" },
  { idx: 2, label: "Gallery photo 3", aspect: "4 / 5" },
  { idx: 3, label: "Hero photo", aspect: "16 / 9" },
  { idx: 4, label: "Logo", aspect: "1 / 1" },
] as const;

export function PhotosForm({
  token,
  initial,
}: {
  token: string;
  initial: { gallery: string[]; hero: string | null; logo: string | null };
}) {
  const [photos, setPhotos] = useState(initial);
  const [busySlot, setBusySlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(slot: number, file: File) {
    setBusySlot(slot);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slot", String(slot));
      const res = await fetch(`/api/claim/${encodeURIComponent(token)}/upload`, {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as
        | { ok: true; publicUrl: string; slot: number }
        | { ok: false; error: string };
      if (!res.ok || !json.ok) {
        setError(json.ok === false ? json.error : `HTTP ${res.status}`);
        return;
      }
      // Update local state to show the new image
      setPhotos((prev) => {
        if (slot >= 0 && slot <= 2) {
          const gallery = [...prev.gallery];
          while (gallery.length <= slot) gallery.push("");
          gallery[slot] = json.publicUrl;
          return { ...prev, gallery };
        }
        if (slot === 3) return { ...prev, hero: json.publicUrl };
        if (slot === 4) return { ...prev, logo: json.publicUrl };
        return prev;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusySlot(null);
    }
  }

  function preview(slot: number): string | null {
    if (slot >= 0 && slot <= 2) return photos.gallery[slot] || null;
    if (slot === 3) return photos.hero;
    if (slot === 4) return photos.logo;
    return null;
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-white p-8 ring-1 ring-black/10">
      <h2 className="text-2xl font-semibold tracking-tight">Photos</h2>
      <p className="text-sm text-[#6b6b6b]">
        Upload your own photos or keep the stock photography we generated.
        JPG, PNG, or WebP. Max 10 MB per file.
      </p>

      {error ? (
        <p className="rounded-xl bg-[#fff1f1] px-4 py-3 text-sm text-[#7a2222] ring-1 ring-[#c33a3a]/30">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {SLOTS.map((slot) => {
          const url = preview(slot.idx);
          const busy = busySlot === slot.idx;
          return (
            <label
              key={slot.idx}
              className="group flex cursor-pointer flex-col gap-2 rounded-2xl bg-[#f5f1e8] p-3 ring-1 ring-black/10 transition hover:ring-2 hover:ring-[#ebff00]"
            >
              <div
                className="relative w-full overflow-hidden rounded-xl bg-[#e5e0d2]"
                style={{ aspectRatio: slot.aspect }}
              >
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={slot.label}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[#6b6b6b]">
                    No photo yet
                  </div>
                )}
                {busy ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white">
                    Uploading…
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2 px-1 text-xs">
                <span className="font-semibold uppercase tracking-[0.18em] text-[#6b6b6b]">
                  {slot.label}
                </span>
                <span className="text-[#0e0e0e]">
                  {url ? "Replace ↑" : "Upload ↑"}
                </span>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadFile(slot.idx, file);
                  e.target.value = ""; // reset so the same file can be re-picked
                }}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
