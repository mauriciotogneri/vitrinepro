# Site conventions

Project-specific build conventions for the Geneva-business marketing sites, applied by `make-website` when building each `index.html`. They sit **on top of** `references/best-practices.md`:

- Use **`best-practices.md`** for all generic web / a11y / SEO / performance / security standards.
- Use **this file** for what's specific to these sites — project policy and the few deliberate reversals of generic advice.
- **On any conflict, this file wins.**

`best-practices.md` already covers the generic baseline (DOCTYPE, `lang`, charset, viewport, semantic landmarks, one `<h1>`, `:focus-visible`, `prefers-reduced-motion`, `aria-current`, touch targets, canonical/OG/Twitter, JSON-LD, dynamic year, end-of-body scripts, no inline handlers, `IntersectionObserver`, `Intl`, …) — satisfy it, don't restate it. Only the project deltas live below.

## Overrides — these reverse `best-practices.md`

- **Fonts: Google Fonts CDN, never self-host.** Load the dossier theme's nominated `display` + `body` families from the Google Fonts CDN — `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` (crossorigin), stylesheet with `&display=swap`. This deliberately reverses best-practices' "subset + self-host fonts" guidance: do **not** self-host `@font-face` for these sites.

## Document & metadata

- **Locale `fr-CH`** throughout: `<html lang="fr-CH">` and `og:locale` `fr_CH`.
- **Absolute URLs under `<base>`:** `<link rel="canonical">`, Open Graph, Twitter Card, and `sitemap.xml` `<loc>` are all absolute under the deploy `<base>`. `og:image` is the generated OG image (1200×630).
- **`theme-color`** = the dossier theme's `theme-color` value.

## JSON-LD

Beyond the generic rule (chosen `LocalBusiness` subtype, visible-content-backed only):

- `image` / `logo` / `photo` reference only **real** media (the official `logo`, `photo-*`) or the generated OG image — **never** `stock-*` fallback imagery.
- **Never** include a tax or business-registration identifier (`taxID`, VAT/TVA, Swiss UID / `CHE-…`) — not in JSON-LD, and not anywhere else on the page.

## Skip-to-content link

- Park it **fully off-screen** (not a shallow offset that can peek), revealed only on `:focus-visible` — never plain `:focus`, so pointer/programmatic focus never exposes it.

## `js/main.js`

End-of-body, IIFE, no inline `on*=` handlers. It must:

- Set the copyright year from `new Date().getFullYear()` into an **empty** `<span>` — never write the year as a literal in the markup (no hardcoded fallback).
- Run scroll reveals via `IntersectionObserver`, with a no-`IntersectionObserver` fallback.
- When hours are known, render an `Intl`-based open/closed badge in `Europe/Zurich`.

## Deploy files

Generic shapes come from `best-practices.md` (`robots.txt` `Allow:`+`Sitemap:`, `sitemap.xml`, branded `404.html` with `noindex`, self-contained single file). Project specifics:

- `robots.txt` `Sitemap:` and `sitemap.xml` `<loc>` are absolute under `<base>`; the sitemap lists the **single homepage URL** (these are one-page sites).
- `404.html` copy is in **fr-CH**.
- `.nojekyll` (empty) — required because the sites deploy to **GitHub Pages**.
