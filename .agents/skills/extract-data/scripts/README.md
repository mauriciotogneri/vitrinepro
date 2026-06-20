# render assist

No-login headless-browser helper for the `extract-data` skill. Renders **one
public URL** in headless Chromium and prints a JSON payload with rendered **facts**
(title, meta, JSON-LD, visible text, links) and **branding** signals from computed
styles (palette, fonts, theme-color, shape, depth).

Best-effort fetch of a **public** page — **no login, no anti-bot bypass**. Same
posture as `curl`, just with a JS engine, so it recovers data from JS-rendered
public sites (the business's own site, JS-rendered directories) that a plain fetch
returns thin/empty. It does **not** defeat login walls: Facebook/Instagram photo
tabs stay out of reach by design — rely on the own site / Google / review platforms
/ aggregators for venue imagery, and the keyless Graph picture (logo) + Instagram
`og:image` (avatar) for the marks.

Runs in the **main agent** only (the fan-out sub-agents have web tools, not a
browser), so it is a post-fan-out assist — not part of the parallel gather.

## One-time setup

```sh
cd .agents/skills/extract-data/scripts
npm install
npx playwright install chromium
```

The Chromium binary may already be cached under `~/.cache/ms-playwright`, in which
case the last command is a no-op.

## Usage

```sh
node .agents/skills/extract-data/scripts/render.mjs <url> [--timeout=30000] [--follow-posts] [--max-posts=24]
```

Prints JSON to stdout:

```json
{ "ok": true, "url": "...", "status": 200, "title": "...", "metas": {...},
  "jsonLd": [...], "links": [...], "bodyText": "...",
  "branding": { "cssVars": {...}, "roles": {...}, "themeColor": "#...", "googleFonts": true } }
```

With `--follow-posts`, after rendering a profile/listing page it also visits each
Instagram `/p/`·`/reel/` post permalink (and Facebook `fbid=` photo permalink) the
page links to — same site only, **not** `/photos` tab pages — and adds a `posts`
array — `[{ permalink, image, caption, images }]`. For each post it takes
`og:image` when present (Instagram), and **also scans the page markup for embedded
`scontent…fbcdn.net` / `cdninstagram.com` photo URLs** (`images[]`) — which is how
**Facebook** photos are recovered even though FB leaves `og:image` empty behind its
logged-out wall. `image` is the best single pick (`og:image`, else the first
scanned URL). This recovers the first page of **public, logged-out** post images
(an Instagram grid, ~12 most-recent; or a Facebook page's recent photos). Still no
login. Caveats: a Facebook photo page also embeds the **cover + adjacent
thumbnails**, so `images[]` candidates need confirming; it's behind a wall so it's
**fragile** (FB can close the leak); carousels/reels give the cover/thumbnail
frame; URLs are **time-signed and expire** (download promptly); deeper history
needs auth.

On block / empty / error it prints `{ "ok": false, "error": "..." }` and exits
non-zero — the caller records the source as blocked/error and moves on, never
aborting the run.
