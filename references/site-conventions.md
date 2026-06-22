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

## Images

Promotes best-practices' soft "modern formats with fallback" line to a hard rule for these sites.

- **Content photos ship dual-format** — every photographic image (`photo-*`, decorative `stock-*`) is a `<picture>` with a WebP `<source>` + a **JPEG `<img>` fallback**: `<picture><source type="image/webp" srcset="…/x.webp"><img src="…/x.jpg" width="…" height="…" decoding="async"></picture>`. Keep `width`/`height`/`decoding="async"` (and below-the-fold `loading="lazy"`) on the inner `<img>`; the `<source>` carries the WebP.
- **Build both formats** — ensure each chosen content photo exists as **both** `.webp` and `.jpg` in `<out>/assets/`, transcoding the missing one with ImageMagick (`convert in.jpg -quality 82 out.webp`, or `convert in.webp out.jpg`; libwebp ships with `convert`). If no image tooling is available, emit a single-format `<img>` and flag it in the summary — same posture as favicon/OG generation.
- **LCP photo** keeps `fetchpriority="high"` plus a matching `<link rel="preload" as="image" href="…/x.webp" type="image/webp">`; the `type` lets non-WebP browsers skip the preload and still render the JPEG.
- **Scope: photos only.** Logos, favicons, the OG image, and inline SVG are unaffected — they stay SVG/PNG/ICO. Never wrap a logo `<img>` in `<picture>`.
- **CSS targets the inner `<img>`** — since the photo now sits inside `<picture>`, style the `<img>` itself (`figure img`); avoid child-combinator or positional selectors that assume the image is a direct child (`figure > img`, `img:first-child`).

## Contact & location

A **contact** form plus native links — **never a reservation/booking form**.

- **CTA labels — contact, never booking:** every call-to-action button or link anywhere on the site (hero, sticky header, inter-section CTAs, footer) uses contact-oriented wording — "Nous contacter" (or "Écrivez-nous", "Prendre contact") — pointing to `#contact` or a native `tel:`/`mailto:`/WhatsApp path. **Never** label a button "Réserver", "Réservez une table", "Prendre rendez-vous", or any wording implying an on-site booking/reservation the site doesn't offer.
- A **Formspree** POST form `<form action="https://formspree.io/f/{{FORMSPREE_ID}}" method="post">` collecting **name, email, and message only**, with labelled (`<label for>`), `autocomplete`-tokened, typed, `required` fields. **Never** build a reservation/booking form or add its fields (date, time-slot, party size, appointment picker), even for restaurants or businesses that take bookings — a plain contact form only. The `{{FORMSPREE_ID}}` is a placeholder — **flag it** in the summary as must-replace for the form to work.
- Alongside it, the real contact paths from the dossier: `tel:`, `mailto:`, and WhatsApp (`https://wa.me/<intl-number>`).
- **Address → Google Maps directions (always):** wherever the page shows the venue's street address — the contact "visit us / in store" block **and/or** the location/"find us" section beside the map — render it as a **link to driving directions**, never plain static text: `<a href="https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>" target="_blank" rel="noopener noreferrer">…address…</a>`, reusing the **same `<lat>,<lng>` as the map embed**. If the business has no map/coords, fall back to `destination=<URL-encoded "Street nº, postcode City">`. Give it a visible affordance ("Voir l'itinéraire" — a `dir/?api=1` link, **not** a `?q=` "open in Maps" link). Apply it even when the map is also embedded on the page.
- **Two-column layout (always):** put the **contact form on the right** and the **contact info on the left** (the native links — phone, WhatsApp, address / "visit in store" block). Keep the **DOM/source order matching this visual order** (info block first, then the form) so reading and focus order stay aligned — never reorder with CSS `order`/`grid-column`. On narrow screens they stack in that same order (info, then form).
- **Location map** (only when a map is shown): always embed **Google Maps**, **directly visible on page load with no click-to-load button** — a plain `<iframe>` (`https://www.google.com/maps?q=<lat>,<lng>&z=16&hl=fr&output=embed`) inside a fixed `aspect-ratio` box. This is a deliberate exception to `best-practices.md`'s click-to-load embed guidance — never use OpenStreetMap or a press-to-reveal placeholder.
  - **Never let the map box overflow / overlap the neighbouring card** (a recurring bug). Root cause: the map wrapper is a grid item, the grid stretches it (`align-items:stretch`, the default) to the height of the **taller** sibling card, and if the wrapper also has an `aspect-ratio` the browser then derives the wrapper's **width from that stretched height** (`height × ratio`) — far wider than its track — so it laps over the card. (`min-width:0` does **not** help: the box is _growing_, not failing to shrink.) Correct pattern: **do not put `aspect-ratio` on a stretched map wrapper.** Make the wrapper `position:relative; overflow:hidden` with a **`min-height`** (its height in the stacked 1-col layout and a floor); let `align-items:stretch` give it the row height in 2-col (equal-height columns, no ratio to inflate the width); and make the iframe `position:absolute; inset:0; width:100%; height:100%`. The wrapper's width then always equals its grid track. (If you instead want a fixed map ratio, keep `aspect-ratio` but add `align-self:start` so the ratio derives the height _from_ the track-bound width, never the reverse.)
  - **Verify the map by measuring, not just screenshotting.** The iframe won't load offline and a blank/slow iframe (plus fallback-font card heights) can hide the overflow in a screenshot. Check the computed `.map` width ≤ its grid track (e.g. compare `getBoundingClientRect()` of the map vs the card, expecting a gap not an overlap) at desktop **and** mid/tablet widths.

## Social links

- **Only link a social profile the dossier shows is public/accessible.** In particular, link an Instagram account only when the dossier shows it is public; if it's private (or flagged private in the dossier), **omit the link** entirely — never link a profile a visitor can't open.

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
