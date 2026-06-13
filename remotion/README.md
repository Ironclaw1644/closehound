# CloseHound — explainer video (Remotion)

Editable source for the CloseHound explainer. The site already ships rendered
MP4s in `public/` (`demo.mp4`, `demo-loop.mp4`, `demo-poster.jpg`). Use this
project to re-render, restyle, or add an AI voiceover.

## Compositions

| ID     | Length | Output                     | Used on            |
| ------ | ------ | -------------------------- | ------------------ |
| `Demo` | 31s    | `../public/demo.mp4`       | `/demo` page       |
| `Loop` | 8s     | `../public/demo-loop.mp4`  | landing hero (muted autoplay) |

## Develop

```bash
cd remotion
npm install
npm run studio        # live preview at http://localhost:3000
```

## Render

```bash
npm run render:demo   # → ../public/demo.mp4
npm run render:loop   # → ../public/demo-loop.mp4 (muted)
```

Then regenerate the poster:

```bash
ffmpeg -y -ss 23 -i ../public/demo.mp4 -frames:v 1 -q:v 3 ../public/demo-poster.jpg
```

## Add an AI voiceover (Google Cloud TTS)

The narration is pre-written and timed to the composition. It wasn't baked into
the shipped file because the build sandbox can't reach `googleapis.com` — but
your machine / CI can.

```bash
GOOGLE_API_KEY=your_key node scripts/generate-voiceover.mjs   # → ../public/voiceover.mp3
```

Then in `src/Demo.tsx` uncomment the two voiceover lines (the `Audio`/`staticFile`
import and the `<Audio src={staticFile("voiceover.mp3")} />` tag) and re-render.
Tune the voice in `scripts/generate-voiceover.mjs` (e.g. `en-US-Studio-O`).

## Notes

- Brand tokens live in `src/theme.ts`; shared pieces in `src/components.tsx`.
- This folder is intentionally excluded from the Next.js build (`tsconfig.json`
  `exclude`), so it never affects the app's typecheck or deploy.
