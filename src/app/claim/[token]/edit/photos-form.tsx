"use client";
import { useState } from "react";

const SLOTS = [
  { idx: 0, label: "Gallery photo 1", aspect: "4 / 5" },
  { idx: 1, label: "Gallery photo 2", aspect: "4 / 5" },
  { idx: 2, label: "Gallery photo 3", aspect: "4 / 5" },
  { idx: 3, label: "Hero photo", aspect: "16 / 9" },
  { idx: 4, label: "Logo", aspect: "1 / 1" },
] as const;

// Hard size limit (matches the server-side check in /api/claim/<token>/upload).
// Catching client-side avoids a wasted upload + a confusing "HTTP 413" later.
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function PhotosForm({
  token,
  initial,
}: {
  token: string;
  initial: { gallery: string[]; hero: string | null; logo: string | null };
}) {
  const [photos, setPhotos] = useState(initial);
  const [busySlot, setBusySlot] = useState<number | null>(null);
  // Determinate progress for the active upload (0..1). null when idle.
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Client-side guards before the upload kicks off. Catches the two
  // failure modes that produce confusing server errors ("HTTP 413" /
  // unsupported MIME) and surfaces a friendly message instead.
  function validateBeforeUpload(file: File): string | null {
    if (!ALLOWED_TYPES.has(file.type)) {
      return `Unsupported file type (${file.type || "unknown"}). JPG, PNG, or WebP only.`;
    }
    if (file.size > MAX_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return `File is too big (${mb} MB). Max 10 MB per photo.`;
    }
    return null;
  }

  async function uploadFile(slot: number, file: File) {
    const reason = validateBeforeUpload(file);
    if (reason) {
      setError(reason);
      return;
    }
    setBusySlot(slot);
    setProgress(0);
    setError(null);

    // XHR instead of fetch so we can report upload progress (fetch's
    // streams API exists but isn't supported widely enough to rely on for
    // real users).
    const xhr = new XMLHttpRequest();
    const url = `/api/claim/${encodeURIComponent(token)}/upload`;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slot", String(slot));

    const done: Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> =
      new Promise((resolve) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.min(0.95, e.loaded / e.total)); // hold at 95% until server replies
          }
        });
        xhr.addEventListener("load", () => {
          try {
            const json = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && json.ok) {
              resolve(json);
            } else {
              resolve({
                ok: false,
                error: json?.error ?? `HTTP ${xhr.status}`,
              });
            }
          } catch {
            resolve({ ok: false, error: `HTTP ${xhr.status}` });
          }
        });
        xhr.addEventListener("error", () =>
          resolve({ ok: false, error: "Network error. Check your connection." })
        );
        xhr.addEventListener("abort", () =>
          resolve({ ok: false, error: "Upload cancelled." })
        );
        xhr.open("POST", url);
        xhr.send(fd);
      });

    const result = await done;
    setProgress(1);
    if (!result.ok) {
      setError(result.error);
      setBusySlot(null);
      setProgress(null);
      return;
    }
    setPhotos((prev) => {
      if (slot >= 0 && slot <= 2) {
        const gallery = [...prev.gallery];
        while (gallery.length <= slot) gallery.push("");
        gallery[slot] = result.publicUrl;
        return { ...prev, gallery };
      }
      if (slot === 3) return { ...prev, hero: result.publicUrl };
      if (slot === 4) return { ...prev, logo: result.publicUrl };
      return prev;
    });
    // Brief pause so the bar visibly hits 100% before clearing.
    setTimeout(() => {
      setBusySlot(null);
      setProgress(null);
    }, 200);
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-xs font-semibold text-white">
                    <span>
                      Uploading…{" "}
                      {progress !== null
                        ? `${Math.round(progress * 100)}%`
                        : null}
                    </span>
                    <div className="h-1 w-3/4 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-[#ebff00] transition-[width] duration-150"
                        style={{
                          width: `${Math.round((progress ?? 0) * 100)}%`,
                        }}
                      />
                    </div>
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
