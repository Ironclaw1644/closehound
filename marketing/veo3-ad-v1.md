# CloseHound — Paid Ad v1 (Veo 3 hook + real screen capture)

**Format:** 9:16 vertical (Reels / TikTok / Shorts), ~24s. Also export 1:1 + 16:9 cuts.
**No face, no human voice.** AI voiceover + on-screen captions.
**Goal:** one idea — *the government voucher can pay more than the mortgage* — shown in the real app.

---

## Structure (24s)

| Time | Scene | Source |
|---|---|---|
| 0:00–0:03 | **Hook** — cinematic b-roll + bold text | Veo 3 |
| 0:03–0:18 | **Demo** — the app finds a deal where the voucher beats the mortgage | Real screen capture |
| 0:18–0:24 | **Close** — value line + CTA end card | Screen capture / static |

---

## Shot-by-shot

### 0:00–0:03 — HOOK (Veo 3 clip)
On-screen caption (big, centered): **"What if the government paid your mortgage?"**
Then snap to: **"In the right ZIP code, it basically does."**

### 0:03–0:18 — DEMO (record the live app, mock mode for a clean run)
Record this exact flow at 9:16 (record the browser window, then crop to phone frame):
1. `/screen` with **Cleveland (Cuyahoga)** already selected → click **Run screen**. *(caption: "Pick a market.")*
2. ZIP grid fills in → click ZIP **44110**. *(caption: "Pull the HUD voucher rents.")*
3. Deal table fills, ranked by Deal Score → click the **top deal (Score 100, ~$133k)**. *(caption: "Match live listings.")*
4. Drawer opens. Hold 2s on the numbers:
   - Gross rent (voucher) **$1,925/mo**, P&I **−$708**, **Net cash flow +$462/mo**, **Deal Score 100**.
   - *(caption, timed to the net-CF line: "Voucher rent beats the mortgage.")*

### 0:18–0:24 — CLOSE
End card (static or last app frame, dimmed) with the reticle logo:
- Line 1: **"Find them in every market."**
- Line 2 (smaller): **closehound.com · 10 free screens · no card**

---

## AI voiceover script (TTS-ready — feed to the SA voiceover or ElevenLabs)
> "What if the government paid most of your mortgage? In the right markets, the Section 8 voucher rent beats the mortgage on the exact same house. CloseHound screens live listings against the official HUD voucher for every ZIP, underwrites each one, and ranks them by deal score. This Cleveland house cash-flows four hundred and sixty two dollars a month — on a check that shows up whether the tenant has a rough month or not. Find them in every market. Start free at closehound dot com."

*(~22s at a calm pace. Trim the middle sentence if it runs long.)*

## Caption stack (CapCut, on-brand: bold sans, chartreuse highlight word)
- "What if the government paid your mortgage?"
- "In the right ZIP, it basically does."
- "Real HUD voucher rents. Every ZIP."
- "Voucher: $1,925/mo  →  beats the mortgage"
- "Net cash flow: +$462/mo"
- "Find them in every market → closehound.com"

---

## Veo 3 hook prompts (3 variants to A/B — 8s, vertical 9:16)
1. *"Cinematic slow push-in on a modest American suburban single-family house at golden hour, a government-style check subtly overlaying the frame and dissolving into the front door; warm, hopeful, premium real-estate-investor tone; no text, no people, shallow depth of field, 9:16."*
2. *"Aerial drone shot rising over a quiet midwest residential street of affordable homes at dawn, soft fog, money-green and gold color grade, sense of opportunity; cinematic, no text, no people, 9:16."*
3. *"Macro shot of a mortgage statement and a HUD voucher document side by side on a wood desk, a gold coin stack tipping the balance toward the voucher; dramatic side light, shallow focus, fintech-premium feel; no text, no people, 9:16."*

(You have `GEMINI_API_KEY` — Veo 3 is reachable via the Gemini API / Google Flow. If video-gen isn't enabled on the key, generate in Flow and drop the 8s clip in as the first 3s.)

---

## Production checklist
- [ ] Record the demo flow at high res (QuickTime screen record of the Chrome window, mock mode, dark→light app surface). Or have CloseHound's agent drive the app while you record.
- [ ] Generate the Veo 3 hook (prompt #1 first) → trim to 3s.
- [ ] Generate the voiceover (`remotion/scripts/generate-voiceover-sa.mjs` or ElevenLabs).
- [ ] CapCut: hook → demo → end card; add captions synced to the VO; music bed low (-18dB); brand colors.
- [ ] Export 9:16 (primary), then 1:1 and 16:9.
- [ ] 3 hook variants for the first 3s → test which holds attention.

## Notes
- Keep every number on screen REAL (it's a real screen recording in mock mode — the figures match the engine).
- The honest framing ("beats the mortgage in the right markets," not "always") keeps it credible — same voice as the site.
