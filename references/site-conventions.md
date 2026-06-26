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

## Image enlargement (lightbox)

Every photographic image opens in a click-to-enlarge lightbox — a self-contained behaviour layered on the existing markup, with no new assets and no per-image authoring.

- **Scope = `<picture>` only.** Wire every `<picture> img` — which, by the **Images** convention, is exactly the content photos (`photo-*`, decorative `stock-*`). Logos, favicons, inline SVG icons and the map `<iframe>` are never wrapped in `<picture>`, so they are excluded by construction. The JS finds the photos; do **not** add per-image classes or wrappers in the HTML.
- **Native `<dialog>`.** Build one `<dialog class="lightbox">` and open it with `showModal()` (native focus-trap, `Esc`, `::backdrop`); feature-detect `showModal` and otherwise open the image URL in a new tab. Show the photo's **already-loaded** asset (`img.currentSrc || img.src`) — it adds no image weight. Restore focus to the triggering photo on close, and lock background scroll with a root class (`html.lightbox-open { overflow: hidden; scrollbar-gutter: stable }`) while open.
- **Each photo is a control:** `role="button"`, `tabindex="0"`, `aria-haspopup="dialog"`, and a locale-aware `aria-label` ("Agrandir : …" / "Enlarge: …", switched on `documentElement.lang`). Enter activates on keydown, Space on keyup (native-button keys). The enlarged `<img>` takes `alt=""` (the visible `<figcaption>` carries the description — no double announcement) and copies the source's `width`/`height` (CLS). Give the trigger an **inset** focus ring (`outline-offset: -3px`) so it isn't clipped by gallery figures' `overflow: hidden`.
- **JS is identical across every site** — a standalone IIFE appended to `js/main.js` (copy it verbatim from any built site, e.g. `docs/webs/le-the_restaurant/js/main.js`; it declares its own `doc` and depends on nothing else in the file). **CSS is themed per site** in that site's tokens: a dark scrim from the darkest token + a faint accent glow, the frame in the site's radius/border/shadow, a **light** caption/icon (the overlay is always a dark environment, so the site's dark text tokens won't read), and the close-button hover in the brand accent. Keep the structure identical (`.lightbox`, `.lightbox__fig` / `__img` / `__cap` / `__close`; the `lb-fade` / `lb-zoom` keyframes gated behind `prefers-reduced-motion: no-preference`); vary only the values.

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
- Wire a photo **lightbox** over every `<picture>` (see **Image enlargement (lightbox)**) — a standalone IIFE appended after the main one, identical across sites.

## Legal page (`legal.html`)

Every site ships a dedicated **legal & privacy page** at `<out>/legal.html`, linked from the footer (see `references/site-structure.md` → **Footer**). Build it from the **dossier's published data only** — never invent an operator, address, or identifier.

- **Standalone fr-CH page** (`<html lang="fr-CH">`) that **reuses the site's `css/style.css`** — style its `.legal-page` container there, don't add a separate stylesheet. Standard head: charset, viewport, `<title>Mentions légales &amp; confidentialité — <Business></title>`, description, `theme-color`, `robots: index, follow`, an absolute `<link rel="canonical">` under `<base>`, favicons, and the same Google-Fonts links as the homepage. No header/nav and no site footer — just a `<main class="legal-page">` with an `<h1>`, a "Dernière mise à jour" date, the sections below, and a link back to the homepage (`index.html`).
- **Section set** (include only what the dossier supports): **Éditeur du site** (business name, address, phone — public contact details only), **Hébergement** (GitHub Pages / GitHub, Inc.), **Responsable du traitement** (Swiss **nLPD**), **Données que nous traitons** (the contact form's name/e-mail/message via **Formspree**, plus the host's technical logs), **Cookies** (the site itself sets none; Google Maps/Fonts may), **Transferts à l'étranger** (GitHub/Formspree/Google in the US; Swiss-U.S. Data Privacy Framework or standard contractual clauses), **Durée de conservation**, **Vos droits** (nLPD + the **PFPDT** as supervisory authority), **Propriété intellectuelle & images**.
- **Mark it as a draft to validate** — carry an HTML comment noting the page is a generated template to be reviewed by the operator (and, if needed, legal counsel) before publication.
- **No tax/registration identifier — ever.** The legal page is bound by the same hard rule as the rest of the site: **never** print a Swiss UID / `CHE-…` / `IDE`, a VAT/TVA number, or any `taxID` — not even under "Éditeur du site" (name + address + contact only). This is the spot where that rule is easiest to violate; don't.

## Web app manifest (`site.webmanifest`)

Every site ships a `site.webmanifest` at `<out>/` and links it from the homepage `<head>` with `<link rel="manifest" href="site.webmanifest">`, placed right after the `apple-touch-icon` link. It makes the site installable with a branded icon + splash.

- **JSON fields:** `name` ("<Business> — <short trade>, Genève"), `short_name` (the brand), a truthful one-line `description` from the dossier, `"lang": "fr-CH"`, `"start_url": "./"`, `"scope": "./"`, `"display": "standalone"`, `theme_color` = the dossier theme's `theme-color` (the same value as the `<meta name="theme-color">`), and `background_color` = the page background.
- **Icons reference only assets that exist** in `<out>/assets/` (the favicons from step 6): the 512×512 PNG with both `"purpose": "any"` and `"purpose": "maskable"`, plus the 32×32 PNG and the 180×180 `apple-touch-icon.png` (add `favicon.svg` only if one was generated). Never point an icon at a file the build didn't produce.

## Deploy files

Generic shapes come from `best-practices.md` (`robots.txt` `Allow:`+`Sitemap:`, `sitemap.xml`, branded `404.html` with `noindex`, self-contained single file). Project specifics:

- `robots.txt` `Sitemap:` and `sitemap.xml` `<loc>` are absolute under `<base>`; the sitemap lists the **single homepage URL** (these are one-page sites).
- `404.html` copy is in **fr-CH**.
- **Jekyll is disabled repo-wide by `docs/.nojekyll`** — a single empty file at the Pages publish-source root (`docs/`), committed once as repo infrastructure. **Do not emit a per-site `.nojekyll`** under `<out>`: GitHub Pages only honours `.nojekyll` at the publish root, so a nested copy does nothing for the live portfolio.
