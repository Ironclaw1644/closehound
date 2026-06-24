# CloseHound — Paid Ad v2 (persuasion cut)

**Status: SCRIPT FOR APPROVAL. Do NOT render Veo / spend until the owner signs off on this doc.**

**Format:** 9:16 vertical primary (Reels / TikTok / Shorts), ~30s. Also export 1:1 + 16:9 cuts.
**No face, no human voice.** AI voiceover (Google SA TTS path) + burned-in captions for sound-off viewing.
**One promise:** *the government voucher can pay more than the mortgage — and CloseHound finds those houses for you.*

> **Numbers policy (guardrail):** every figure on screen must match the real app. The reference figures below are from the v1 demo capture (Cleveland, ZIP 44110, Deal Score 100): **voucher rent $1,925/mo · P&I −$708 · net cash flow +$480/mo**. Net cash flow moves with the assumptions, so **re-confirm the exact number on the final re-record and update the VO + captions to match.** The voucher rent ($1,925) and Deal Score (100) are stable, verifiable outputs. No invented stats, scarcity, or testimonials.

---

## Why this converts (the persuasion levers — all honest)
This isn't trickery; it's the legitimate high-conversion toolkit, every claim backed by the real $480/mo deal:

1. **Pattern interrupt + specificity (0–1s):** open on a precise dollar figure, not a slogan. "$1,925 a month for a $133,000 house" *sounds* true because it is. Specific numbers out-pull round ones.
2. **Loss aversion / FOMO:** "most investors never check, so they overpay" — the viewer feels they're *already losing* money by not knowing this. Stronger than promising a gain.
3. **Authority / trust anchor:** "the official HUD voucher," "real listings" — defuses the "too good to be true" reflex that kills financial ads.
4. **Curiosity gap:** the hook states the *what* ($1,925 guaranteed) but withholds the *how* (which ZIPs, how to find them) — you keep watching to close the loop.
5. **Value anchoring:** $5,760/yr from one deal vs **$39** for the tool. The price feels trivial next to the outcome ("one deal pays for years").
6. **Friction removal / soft urgency:** "100 free credits, no card" — the smallest possible yes. No fake countdowns, no fake scarcity (those torch trust on money products).
7. **Proof by demonstration:** the middle is the *real app* doing the work on screen. Show, don't claim.

Sound-off rule: it must land with **captions only** — 80%+ of feed views are muted.

---

## Structure (≈30s)

| Time | Beat | Source | Job |
|---|---|---|---|
| 0:00–0:03 | **Hook** — bold $ claim over cinematic home | Veo 3 (have hook.mp4) | Stop the scroll in 1s |
| 0:03–0:09 | **Agitation** — "you're overpaying; the voucher beats the mortgage" | Veo 3 (street b-roll) | Create the gap / stakes |
| 0:09–0:23 | **Proof / demo** — the app finds the +$480/mo deal | Real screen capture | Make it believable |
| 0:23–0:30 | **Value + CTA** — $5,760/yr vs $39, start free | Endcard (static) | Convert |

---

## Shot-by-shot

### 0:00–0:03 — HOOK  *(Veo: `marketing/closehound-hook.mp4`, golden-hour home — already rendered)*
- **VO:** "The government will pay nineteen twenty-five a month to rent this hundred-and-thirty-three-thousand-dollar house."
- **Caption (big, centered, chartreuse highlight on the number):** `$1,925/mo` → `$133,000 house`
- Pacing: the number is on screen by frame 1. Hard cut on the last word.

### 0:03–0:09 — AGITATION  *(Veo: quiet midwest street at dawn — render new, prompt below)*
- **VO:** "In the right markets the Section 8 voucher pays *more* than the open market — for the exact same house. Most investors never check, so they overpay for rentals that barely break even."
- **Caption:** `The voucher can beat the mortgage.` then `Most investors never check.`

### 0:09–0:23 — PROOF / DEMO  *(real screen capture, mock mode for a clean deterministic run; record at 9:16 or crop)*
Record this exact flow (re-use / re-cut `marketing/closehound-demo.mp4`):
1. `/screen`, **Cleveland (Cuyahoga)** selected → click **Run screen**.  *(caption: "Pick a market.")*
2. ZIP grid fills → click ZIP **44110**.  *(caption: "Real HUD voucher rents — every ZIP.")*
3. Deal table fills, ranked by Deal Score → click the **top deal (Score 100, ~$133k)**.  *(caption: "Live listings, underwritten instantly.")*
4. Drawer opens — hold ~2.5s on the numbers.
   - **VO (over the demo):** "CloseHound checks every listing against the real HUD voucher and underwrites it. This Cleveland house: voucher rent nineteen twenty-five, every cost covered, net cash flow four hundred eighty dollars a month. Deal Score: one hundred."
   - **Caption punches, timed to the lines:** `$1,925/mo voucher` · `+$480/mo net cash flow` · `SCORE 100`

### 0:23–0:30 — VALUE + CTA  *(static endcard, reticle logo, dimmed last app frame behind)*
- **VO:** "That's over five thousand seven hundred dollars a year — from one deal. CloseHound is thirty-nine dollars. One deal pays for years. Screen your first market free at closehound dot com."
- **Endcard text:**
  - Line 1: **One deal pays for years.**
  - Line 2: `$5,760/yr from one house  ·  CloseHound $39/mo`
  - Line 3 (CTA, chartreuse): **closehound.com**
  - Line 4 (small mono): `100 free credits · ~10 markets · no card`

---

## Full voiceover script (TTS-ready — one take, calm-confident, ~28s)
> "The government will pay nineteen twenty-five a month to rent this hundred-and-thirty-three-thousand-dollar house. In the right markets, the Section 8 voucher pays more than the open market — for the exact same house. Most investors never check, so they overpay for rentals that barely break even. CloseHound checks every listing against the real HUD voucher and underwrites it. This Cleveland house: voucher rent nineteen twenty-five, every cost covered, net cash flow four hundred eighty dollars a month. Deal Score: one hundred. That's over five thousand seven hundred dollars a year — from one deal. CloseHound is thirty-nine dollars. One deal pays for years. Screen your first market free at closehound dot com."

*(If it runs long, trim the "barely break even" clause. Numbers must match the final demo capture.)*

---

## Hook A/B variants (first 3s — test which holds attention)
Swap only the hook line + first caption; keep the rest identical.

- **A — Specificity / authority (lead):** "The government will pay $1,925 a month to rent this $133,000 house."  caption `$1,925/mo guaranteed`
- **B — Curiosity / dream:** "What if the rent showed up every month — guaranteed by the government — and beat your mortgage?"  caption `Rent that beats the mortgage?`
- **C — Loss aversion:** "Most investors leave five thousand seven hundred dollars a year on the table. Here's the deal they miss."  caption `You're losing $5k/yr.`

Run all three to the same demo+CTA; keep the winner by 3-second hold-rate / hook-through.

---

## Veo 3 render prompts (9:16, `veo-3.0-fast-generate-001`; **omit `personGeneration`**; steer "no people" in-prompt)
1. **(HAVE — hook.mp4)** "Cinematic slow push-in on a modest American suburban single-family house at golden hour; warm, hopeful, premium real-estate tone; no text, no people, shallow depth of field, 9:16."
2. **(NEW — agitation b-roll)** "Aerial drone shot rising slowly over a quiet midwest residential street of modest affordable homes at dawn, soft fog, money-green and gold color grade, a sense of untapped opportunity; cinematic, no text, no people, 9:16."
3. **(OPTIONAL — concept beat)** "Macro shot of a HUD housing-voucher document and a mortgage statement side by side on a wood desk, a stack of gold coins tipping a small brass scale toward the voucher; dramatic side light, shallow focus, fintech-premium; no text, no people, 9:16."

Veo 3 clips carry their own AAC audio — **mute them in the stitch** (the VO is the only voice).

---

## Render pipeline (run ONLY after script sign-off — ~$6–9 of Veo)
1. **Veo scenes:** prompt #2 (required), optionally #3. Submit each to `…:predictLongRunning` with `{instances:[{prompt}],parameters:{aspectRatio:"9:16"}}`; poll + download via `GOOGLE_API_KEY=… VEO_OP=… python3 scripts/veo-poll.py` (set `OUT` per scene).
2. **Voiceover:** `VOICEOVER_TEXT="<full VO above>" VOICEOVER_OUT=public/ad-vo-v2.mp3 GOOGLE_SA_FILE=/path/to/sa.json node remotion/scripts/generate-voiceover-sa.mjs` (SA bearer path — the API key blocks Cloud TTS).
3. **Demo footage:** re-cut `marketing/closehound-demo.mp4` to the 4 beats above (clean tab capture; mock mode for deterministic numbers). Confirm the on-screen net-CF figure and update VO/captions if it differs.
4. **Stitch (ffmpeg):** concat hook(3s) → agitation(6s) → demo(~14s) → endcard(7s); lay `ad-vo-v2.mp3` as the master audio (mute all Veo/clip audio); add a low music bed (≈−20dB) that lifts on the reveal; **burn captions** (pre-rendered caption PNGs over `overlay`, or `drawtext`) on-brand (bold sans, chartreuse highlight word). Output `marketing/closehound-ad-v2.mp4`.
5. **Platform cuts:** export 9:16 (primary), then center-crop 1:1 and 16:9.

---

## Production checklist
- [ ] Owner approves THIS script (numbers, hook, CTA).
- [ ] Re-record / re-cut the demo flow at 9:16; confirm the live net-CF number.
- [ ] Render Veo scene #2 (and #3 if used).
- [ ] Generate `ad-vo-v2.mp3` (SA TTS path).
- [ ] ffmpeg stitch + burned captions + music bed → `closehound-ad-v2.mp4`.
- [ ] Export 9:16 / 1:1 / 16:9.
- [ ] Cut 3 hook variants (A/B/C) sharing one demo+CTA for A/B testing.

## Honesty notes
- Every number is a real app output; the demo is a real screen recording (mock mode mirrors the live engine).
- Framing stays conditional ("in the right markets," "can beat the mortgage" — not "always"), matching the site's voice and keeping it credible on a financial product.
- Entry price stated as **$39** (Hunter, the cheapest paid plan); free tier is **100 credits ≈ 10 markets, no card** (1 credit per ZIP). Pricing page shows 1,000 / 5,000 / 25,000 credits/mo — consistent.
