---
name: make-website
description: >-
  Build a bilingual (Swiss-French + English) static marketing website for one Geneva business from the dossier produced by extract-data, and write the deployable multi-page site to docs/webs/<slug>/. This is step 3 ("build") of the websites pipeline: extract → enhance → build. Use when the user wants to generate, build, or create the website for a shop whose dossier already exists under data/.
---

# make-website

Turn one business's `extract-data` dossier into a deployable, bilingual (**fr-CH** + **EN**) static website under `docs/webs/<web-slug>/`, and add it to the portfolio index.

**Scope:** this skill starts from an existing dossier and ends when the site is written, self-verified, and linked from `docs/index.html`. It does **not** gather data (that's `extract-data`) and does **not** commit or deploy. **One business per invocation.** **Paths** are relative to the repo root (the working directory): `references/`, `resources/`, `data/`, and `docs/` all live there.

## Inputs

Ask the user for the **path to the dossier folder** (e.g. `data/razor_hairdresser`) — and nothing else. The path must always come from the user: **never assume, default to, or guess it**, and even if a path is passed in the skill arguments, treat it as a suggestion to confirm, not a path to use directly. **Validate** it before building — the folder must exist and contain the dossier markdown `<dir>/<slug>.md`; if it's missing, empty, or ambiguous, ask again rather than proceeding.

From it:

- Read the dossier markdown `<dir>/<slug>.md` **in full** — it is the single source of truth for every fact on the site. Note the files in `<dir>/assets/` (logo, photos).
- Derive the **web slug** = the dossier **folder name**, used unchanged (the dossier slug is `<name-kebab>_<type-kebab>`, joined by a single `_` — keep the whole name, type suffix included). E.g. `razor_hairdresser` → `razor_hairdresser`. Output dir `<out>` = `docs/webs/<web-slug>/`.

## Read before building

1. `references/site-structure.md` — the section menu and top-to-bottom order.
2. `references/best-practices.md` — the **quality bar**. The site must satisfy it. Don't restate it; apply it.
3. `docs/webs/` — survey the **sites already built** there, but as an **anti-reference**: note their palettes, layout archetypes, type pairings, and motion so the new site comes out **visibly distinct** from every one of them. Don't borrow design from any of them — the aim is a portfolio of unique sites, not variations on a theme. (The technical conventions — file layout, head/meta, JSON-LD, hreflang, language switcher, `js/main.js`, `404.html` — come from steps 5, 7 and 9 below and `best-practices.md`, not from copying a sample site.)

## Procedure

### 1. Resolve the output folder

Fix `<out>` = `docs/webs/<web-slug>/`. **If `<out>` already exists, stop and ask** before overwriting — a built site may carry hand edits. Only proceed once the user confirms (then delete the old `<out>` and regenerate clean).

### 2. Derive the base URL

The site deploys to GitHub Pages, so absolute URLs (canonical, hreflang, `og:url`, `og:image`, sitemap `<loc>`) use the real deploy origin. Run `git remote get-url origin`, parse `github.com[:/]<org>/<repo>`, and build:

- `<base>` = `https://<org>.github.io/<repo>/webs/<web-slug>/` (e.g. `https://vndly.github.io/websites/webs/<web-slug>/`).
- `/en/` lives at `<base>en/`.

If there is no remote or it can't be parsed, use a literal `{{BASE_URL}}` token instead and flag it in the final summary.

### 3. Plan content from the dossier

- Map the dossier's available data onto the sections in `site-structure.md`. **Omit any section with no backing data — never fabricate.** No reviews in the dossier → no Reviews section (and no `Review`/`aggregateRating` in the JSON-LD). The structure adapts per business.
- Choose the brand palette (per `resources/info.txt`): use the dossier's stated brand colors if present → else derive from the **logo** → else infer from the business **type/name**.
- Decide the most specific schema.org `LocalBusiness` subtype for the business type (e.g. `BarberShop`, `HairSalon`, `Restaurant`, `Bakery`, `BarOrPub`, `VeterinaryCare`, …); fall back to `LocalBusiness`.

### 4. Build with the frontend-design skill

Invoke the **frontend-design** skill to design and implement the site (your global rule requires it for any UI). Feed it the dossier facts, the chosen palette, the section plan, and the `<base>` URL. Produce distinctive, production-grade output — a design unique to this business that doesn't resemble the other sites in `docs/webs/`. Tell it which assets are **real** (an official `logo`, `photo-*`) vs **fallback** (a generated `logo`, `stock-*`): when only fallback imagery exists, design **photo-light** — lead with brand color, type, and CSS/SVG art and icons rather than photography — and treat any `stock-*` as decorative background only (see step 6).

### 5. Write the files

Create this layout under `<out>`:

```
index.html        fr-CH homepage  (lang="fr-CH")
en/index.html     EN homepage     (lang="en")
css/style.css     shared hand-written CSS (no framework)
js/main.js        shared vanilla JS (no framework)
assets/           logo, photos, favicons, og-image (+ any decorative stock-*)
robots.txt
sitemap.xml
404.html
.nojekyll         empty file (serve dotfiles / skip Jekyll)
favicon.ico
```

Both locales share `css/`, `js/`, and `assets/` (the `/en/` pages reference them with `../`).

### 6. Assets

The dossier separates **official** media from **fallback** stand-ins (a generated `logo`, `stock-*`), labeled in its Media section — carry that distinction through to the build.

- Copy the needed `logo.*` and chosen `photo-*.*` (and only the `stock-*` the design actually uses) from the dossier `<dir>/assets/` into `<out>/assets/`. Reference each with explicit `width`/`height`, `decoding="async"`, `loading="lazy"` below the fold, and `fetchpriority="high"` on the hero/LCP image (never lazy-load it).
- **Official `photo-*`** depict the real business — their `alt`/captions may name it ("La terrasse du restaurant"). **`stock-*` are decorative stand-ins** — use them only as background/atmosphere, give them **honest, generic** `alt` that never claims to show this venue ("Ambiance de cantina mexicaine", not "Notre salle"), keep them out of JSON-LD `image`, and prefer the photo-light design (step 4) over leaning on them. Flag every `stock-*` used as replaceable placeholder imagery in the summary.
- Copy the `logo` whether real or a **generated** placeholder; a generated logo serves as the brand mark for display and as the favicon/OG source, but flag it as a generated placeholder in the summary. If the dossier has **no logo at all** (e.g. it predates the fallback step), generate a simple SVG wordmark/monogram from the name in the brand palette at build time.
- Generate from the logo, if `convert`/ImageMagick (or `sharp`) is available: `favicon.ico`, `favicon-32.png`, `favicon-512.png`, `apple-touch-icon.png`, and a `1200×630` `og-image.png`. **If no image tooling is available**, fall back to referencing the logo directly as a single favicon + OG image, and flag this in the summary.

### 7. Per-page requirements (apply `best-practices.md`)

Each `index.html`:

- `<!DOCTYPE html>`, correct `<html lang>`, `<meta charset="utf-8">` first, responsive viewport (**never** disable zoom).
- **Unique** `<title>` + `<meta name="description">` per locale; `theme-color`; `<meta name="author">`.
- `<link rel="canonical">` + reciprocal `hreflang` (`fr`/`fr-CH`, `en`, `x-default`) + Open Graph + Twitter Card, all absolute under `<base>`; `og:image` = the generated OG image; `og:locale` `fr_CH` / `en`.
- **JSON-LD** for the chosen subtype, with only properties backed by visible content (name, address, `geo`, hours, telephone, `priceRange`, services, ratings/reviews **only if present**). Its `image`/`logo`/`photo` properties reference only **real** media (the logo, `photo-*`) or the generated OG image — **never** `stock-*` fallback imagery.
- Fonts via **Google Fonts CDN**: `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` (crossorigin), stylesheet with `&display=swap`. This is a deliberate exception to `best-practices.md`'s self-host guidance — do **not** self-host `@font-face` for these sites.
- Semantic landmarks (`header`/`nav`/`main`/`section[id]`/`footer`), exactly one `<h1>`, ordered headings, skip-to-content link (parked fully off-screen — not a shallow offset that can peek — and revealed only on `:focus-visible`, never plain `:focus`, so pointer/programmatic focus never exposes it), `:focus-visible`, `prefers-reduced-motion`, `aria-current` on the active nav/locale, touch targets ≥24px.
- A **language switcher** in the nav (and footer) — explicit links between the two locale URLs with `aria-current` on the current one (static host, so no server-side negotiation).
- **Footer:** restate identity, contact/hours, secondary nav, social, language switcher, and legal/copyright with a dynamic year — but **never a "back-to-top" link/button** (the sticky header and logo already return users to the top).
- `js/main.js` (end of body, IIFE, no inline `on*=` handlers): dynamic copyright year, scroll reveals via `IntersectionObserver` with a no-IO fallback, and — if hours are known — an Intl-based open/closed badge (`Europe/Zurich`).

### 8. Contact section

A **contact** form plus native links — **never a reservation/booking form**:

- A **Formspree** POST form `<form action="https://formspree.io/f/{{FORMSPREE_ID}}" method="post">` collecting **name, email, and message only**, with labelled (`<label for>`), `autocomplete`-tokened, typed, `required` fields. **Never** build a reservation/booking form or add its fields (date, time-slot, party size, appointment picker), even for restaurants or businesses that take bookings — a plain contact form only. The `{{FORMSPREE_ID}}` is a placeholder — **flag it** in the summary as must-replace for the form to work.
- Alongside it, the real contact paths from the dossier: `tel:`, `mailto:`, and WhatsApp (`https://wa.me/<intl-number>`).
- **Two-column layout (always):** put the **contact form on the right** and the **contact info on the left** (the native links — phone, WhatsApp, address / "visit in store" block). Keep the **DOM/source order matching this visual order** (info block first, then the form) so reading and focus order stay aligned — never reorder with CSS `order`/`grid-column`. On narrow screens they stack in that same order (info, then form).
- **Location map** (only when a map is shown): always embed **Google Maps**, **directly visible on page load with no click-to-load button** — a plain `<iframe>` (`https://www.google.com/maps?q=<lat>,<lng>&z=16&hl=<fr|en>&output=embed`) inside a fixed `aspect-ratio` box. This is a deliberate exception to `best-practices.md`'s click-to-load embed guidance — never use OpenStreetMap or a press-to-reveal placeholder.

### 9. SEO / deploy files

- `robots.txt`: `User-agent: * / Allow: /` + absolute `Sitemap:` line under `<base>`.
- `sitemap.xml`: both locale URLs, each with `xhtml:link` hreflang alternates.
- `404.html`: self-contained (inline `<style>`), `<meta name="robots" content="noindex">`, bilingual one-liner, link home.
- `.nojekyll`: empty.

### 10. Portfolio index

Append the new site to `docs/index.html` if not already listed, matching the existing entries:
`<a href="webs/<web-slug>/index.html" target="_blank" rel="noopener"><Business Name></a>`. Leave existing entries untouched.

## Verify before finishing

Don't report success without checking:

- Both `index.html` and `en/index.html` exist and are **content-complete in their own language** (full parity — no untranslated leftovers, no empty sections that the other locale fills).
- Every `assets/…`, `css/…`, `js/…` path referenced resolves on disk, and every file in `<out>/assets/` is referenced back (no danglers either way); `/en/` references resolve with `../`.
- All in-page anchors and internal links resolve; the language switcher points each locale at the other.
- JSON-LD reflects only visible content; absolute URLs all use `<base>` consistently; `hreflang` is reciprocal.
- No fabricated **facts** anywhere — every factual claim (hours, prices, services, contact, reviews, copy) traces to the dossier; **imagery** is the sole exception, allowed only under the decorative-only guardrail below.
- Fallback imagery obeys the guardrail: `stock-*` appears only as decoration, with honest generic `alt`, never captioned/alt-texted as this venue, and absent from JSON-LD `image`. Any generated logo and every used `stock-*` are flagged in the summary as replaceable.
- Favicons/OG image were generated (or their absence was flagged); the `{{FORMSPREE_ID}}` (and `{{BASE_URL}}`, if used) placeholders are flagged.
- `docs/index.html` links the new site.

End with a short summary: the business, `<out>`, sections built vs. omitted (and why), any placeholders to replace before deploy, and anything the dossier lacked that would improve the site.

## Constraints & conventions

- **Bilingual, multi-page** (fr-CH root + `/en/`) — every fact in both languages.
- **No framework**: hand-written CSS + vanilla JS. Fonts via Google Fonts CDN (`display=swap` + preconnect).
- **Truthful content only** — omit what the dossier doesn't support; never invent reviews, hours, prices, or copy. The one exception is **imagery**: labeled fallback assets from the dossier (a generated logo, `stock-*`) may be used as **decoration only** — honest generic `alt`, never presented as the real venue, never in JSON-LD, always flagged as replaceable.
- **Accessibility + SEO + performance per `references/best-practices.md`** — it is the bar, not a suggestion.
- **One business per invocation.** Does not commit, push, or deploy.
