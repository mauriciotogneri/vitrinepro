---
name: make-website
description: >-
  Build a Swiss-French (fr-CH) static marketing website for one Geneva business from the dossier produced by extract-data, and write the deployable site to docs/webs/<slug>/. This is step 3 ("build") of the websites pipeline: extract → enhance → build. Use when the user wants to generate, build, or create the website for a shop whose dossier already exists under data/.
---

# make-website

Turn one business's `extract-data` dossier into a deployable, Swiss-French (**fr-CH**) static website under `docs/webs/<slug>/`, and add it to the portfolio index.

**Scope:** this skill starts from an existing dossier and ends when the site is written, self-verified, and linked from `docs/index.html`. It does **not** gather data (that's `extract-data`) and does **not** commit or deploy. **One business per invocation.** **Paths** are relative to the repo root (the working directory): `references/`, `resources/`, `data/`, and `docs/` all live there.

## Inputs

Start by **proposing candidates**: list the `data/` dossier folders that have **no** matching `docs/webs/<slug>/` yet (the dossiers not built into a site) and offer them for the user to choose from. If every dossier already has a site, say so and ask which one to (re)build. Proposing is not deciding — the path must always be **confirmed by the user**: **never auto-pick, assume, default to, or guess it**, and even if a path is passed in the skill arguments, treat it as a suggestion to confirm, not a path to use directly. **Validate** the chosen folder before building — it must exist and contain the dossier markdown `<dir>/<slug>.md`; if it's missing, empty, or ambiguous, ask again rather than proceeding.

From it:

- Read the dossier markdown `<dir>/<slug>.md` **in full** — it is the single source of truth for every fact on the site. Note the files in `<dir>/assets/` (logo, photos).
- The output reuses the dossier **folder name** as `<slug>`, unchanged (the dossier slug is `<name-kebab>_<type-kebab>`, joined by a single `_` — keep the whole name, type suffix included). E.g. `razor_hairdresser` → `razor_hairdresser`. Output dir `<out>` = `docs/webs/<slug>/`.

## Read before building

1. `references/site-structure.md` — the section menu and top-to-bottom order.
2. `references/best-practices.md` — the generic **quality bar** (web/a11y/SEO/performance standards). The site must satisfy it. Don't restate it; apply it.
3. `references/site-conventions.md` — this project's **conventions and overrides** (what's specific to these sites). Apply them too; **on any conflict with `best-practices.md`, the conventions win**.
4. `docs/webs/` — survey the **sites already built** there, but as an **anti-reference**: note their palettes, layout archetypes, type pairings, and motion so the new site comes out **visibly distinct** from every one of them. Don't borrow design from any of them — the aim is a portfolio of unique sites, not variations on a theme. (The technical conventions — file layout, head/meta, JSON-LD, `js/main.js`, `404.html` — come from steps 5, 7 and 9 below, `best-practices.md`, and `site-conventions.md`, not from copying a sample site.)

## Procedure

### 1. Resolve the output folder

Fix `<out>` = `docs/webs/<slug>/`. **If `<out>` already exists, stop and ask** before overwriting — a built site may carry hand edits. Only proceed once the user confirms (then delete the old `<out>` and regenerate clean).

### 2. Derive the base URL

The site deploys to GitHub Pages, so absolute URLs (canonical, `og:url`, `og:image`, sitemap `<loc>`) use the real deploy origin. Run `git remote get-url origin`, parse `github.com[:/]<org>/<repo>`, and build:

- `<base>` = `https://<org>.github.io/<repo>/webs/<slug>/` (e.g. `https://mauriciotogneri.github.io/vitrinepro/webs/<slug>/`).

If there is no remote or it can't be parsed, use a literal `{{BASE_URL}}` token instead and flag it in the final summary.

### 3. Plan content from the dossier

- Map the dossier's available data onto the sections in `site-structure.md`. **Omit any section with no backing data — never fabricate.** No reviews in the dossier → no Reviews section (and no `Review`/`aggregateRating` in the JSON-LD). The structure adapts per business.
- Take the **theme** from the dossier's **Branding / Theme** section — its palette (the semantic roles), typography (`display` + `body`, already nominated as Google-Fonts families), `theme-color`, and shape/depth/spacing + vibe. `extract-data` already derived it (website → logo → name/type) and recorded the **basis + confidence**, so **use it verbatim — don't re-derive it**. Only if a legacy/hand-written dossier lacks the section, fall back to deriving the palette from the **logo** → else the business **type/name**.
- Decide the most specific schema.org `LocalBusiness` subtype for the business type (e.g. `BarberShop`, `HairSalon`, `Restaurant`, `Bakery`, `BarOrPub`, `VeterinaryCare`, …); fall back to `LocalBusiness`.

### 4. Build with the frontend-design skill

Invoke the **frontend-design** skill to design and implement the site (your global rule requires it for any UI). Feed it the dossier facts, the dossier's **theme** (palette, typography, `theme-color`, shape/depth/spacing, vibe), the section plan, and the `<base>` URL. Produce distinctive, production-grade output — a design unique to this business that doesn't resemble the other sites in `docs/webs/`. Tell it which assets are **real** (an official `logo`, `photo-*`) vs **fallback** (a generated `logo`, `stock-*`): when only fallback imagery exists, design **photo-light** — lead with brand color, type, and CSS/SVG art and icons rather than photography — and treat any `stock-*` as decorative background only (see step 6).

### 5. Write the files

Create this layout under `<out>`:

```
index.html        fr-CH homepage  (lang="fr-CH")
css/style.css     hand-written CSS (no framework)
js/main.js        vanilla JS (no framework)
assets/           logo, photos, favicons, og-image (+ any decorative stock-*)
robots.txt
sitemap.xml
404.html
.nojekyll         empty file (serve dotfiles / skip Jekyll)
favicon.ico
```

### 6. Assets

The dossier separates **official** media from **fallback** stand-ins (a generated `logo`, `stock-*`), labeled in its Media section — carry that distinction through to the build.

- Copy the needed `logo.*` and chosen `photo-*.*` (and only the `stock-*` the design actually uses) from the dossier `<dir>/assets/` into `<out>/assets/`. Reference each with explicit `width`/`height`, `decoding="async"`, `loading="lazy"` below the fold, and `fetchpriority="high"` on the hero/LCP image (never lazy-load it).
- **Official `photo-*`** depict the real business — their `alt`/captions may name it ("La terrasse du restaurant"). **`stock-*` are decorative stand-ins** — use them only as background/atmosphere, give them **honest, generic** `alt` that never claims to show this venue ("Ambiance de cantina mexicaine", not "Notre salle"), keep them out of JSON-LD `image`, and prefer the photo-light design (step 4) over leaning on them. Flag every `stock-*` used as replaceable placeholder imagery in the summary.
- Copy the `logo` whether real or a **generated** placeholder; a generated logo serves as the brand mark for display and as the favicon/OG source, but flag it as a generated placeholder in the summary. If the dossier has **no logo at all** (e.g. it predates the fallback step), generate a simple SVG wordmark/monogram from the name in the brand palette at build time.
- Generate from the logo, if `convert`/ImageMagick (or `sharp`) is available: `favicon.ico`, `favicon-32.png`, `favicon-512.png`, `apple-touch-icon.png`, and a `1200×630` `og-image.png`. **If no image tooling is available**, fall back to referencing the logo directly as a single favicon + OG image, and flag this in the summary.

### 7. Per-page requirements

Build `index.html` to satisfy both references read above — `best-practices.md` (generic web/a11y/SEO/performance standards) **and** `site-conventions.md` (this project's conventions + overrides, which **win on any conflict**). Apply them; don't restate them here.

### 8. Contact section

A **contact** form plus native links — **never a reservation/booking form**:

- **CTA labels — contact, never booking:** every call-to-action button or link anywhere on the site (hero, sticky header, inter-section CTAs, footer) uses contact-oriented wording — "Nous contacter" (or "Écrivez-nous", "Prendre contact") — pointing to `#contact` or a native `tel:`/`mailto:`/WhatsApp path. **Never** label a button "Réserver", "Réservez une table", "Prendre rendez-vous", or any wording implying an on-site booking/reservation the site doesn't offer.
- A **Formspree** POST form `<form action="https://formspree.io/f/{{FORMSPREE_ID}}" method="post">` collecting **name, email, and message only**, with labelled (`<label for>`), `autocomplete`-tokened, typed, `required` fields. **Never** build a reservation/booking form or add its fields (date, time-slot, party size, appointment picker), even for restaurants or businesses that take bookings — a plain contact form only. The `{{FORMSPREE_ID}}` is a placeholder — **flag it** in the summary as must-replace for the form to work.
- Alongside it, the real contact paths from the dossier: `tel:`, `mailto:`, and WhatsApp (`https://wa.me/<intl-number>`).
- **Address → Google Maps directions (always):** wherever the page shows the venue's street address — the contact "visit us / in store" block **and/or** the location/"find us" section beside the map — render it as a **link to driving directions**, never plain static text: `<a href="https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>" target="_blank" rel="noopener noreferrer">…address…</a>`, reusing the **same `<lat>,<lng>` as the map embed**. If the business has no map/coords, fall back to `destination=<URL-encoded "Street nº, postcode City">`. Give it a visible affordance ("Voir l'itinéraire" — a `dir/?api=1` link, **not** a `?q=` "open in Maps" link). Apply it even when the map is also embedded on the page.
- **Two-column layout (always):** put the **contact form on the right** and the **contact info on the left** (the native links — phone, WhatsApp, address / "visit in store" block). Keep the **DOM/source order matching this visual order** (info block first, then the form) so reading and focus order stay aligned — never reorder with CSS `order`/`grid-column`. On narrow screens they stack in that same order (info, then form).
- **Location map** (only when a map is shown): always embed **Google Maps**, **directly visible on page load with no click-to-load button** — a plain `<iframe>` (`https://www.google.com/maps?q=<lat>,<lng>&z=16&hl=fr&output=embed`) inside a fixed `aspect-ratio` box. This is a deliberate exception to `best-practices.md`'s click-to-load embed guidance — never use OpenStreetMap or a press-to-reveal placeholder.
  - **Never let the map box overflow / overlap the neighbouring card** (a recurring bug). Root cause: the map wrapper is a grid item, the grid stretches it (`align-items:stretch`, the default) to the height of the **taller** sibling card, and if the wrapper also has an `aspect-ratio` the browser then derives the wrapper's **width from that stretched height** (`height × ratio`) — far wider than its track — so it laps over the card. (`min-width:0` does **not** help: the box is _growing_, not failing to shrink.) Correct pattern: **do not put `aspect-ratio` on a stretched map wrapper.** Make the wrapper `position:relative; overflow:hidden` with a **`min-height`** (its height in the stacked 1-col layout and a floor); let `align-items:stretch` give it the row height in 2-col (equal-height columns, no ratio to inflate the width); and make the iframe `position:absolute; inset:0; width:100%; height:100%`. The wrapper's width then always equals its grid track. (If you instead want a fixed map ratio, keep `aspect-ratio` but add `align-self:start` so the ratio derives the height _from_ the track-bound width, never the reverse.)
  - **Verify the map by measuring, not just screenshotting.** The iframe won't load offline and a blank/slow iframe (plus fallback-font card heights) can hide the overflow in a screenshot. Check the computed `.map` width ≤ its grid track (e.g. compare `getBoundingClientRect()` of the map vs the card, expecting a gap not an overlap) at desktop **and** mid/tablet widths.

### 9. SEO / deploy files

Emit `robots.txt`, `sitemap.xml`, `404.html`, and `.nojekyll` (all in step 5's layout) per `best-practices.md` (generic shapes) + `site-conventions.md` (project specifics — `<base>`-absolute, single-page sitemap, fr-CH `404`, GitHub-Pages `.nojekyll`). Don't restate them here.

### 10. Portfolio index

Register the site in the portfolio index `docs/index.html` — **idempotently, keyed by `<slug>`** (= the dossier folder name). The index is a table where each business is **one `<tr>`** with a **Website** cell and a **Data** cell, each either a button or a `—` placeholder. In the normal pipeline `extract-data` already created this business's row (with the **Data** link) before the build, so you usually just fill in the **Website** side.

Find the row whose `<slug>` appears in its Website href (`webs/<slug>`) or Data href (`data.html?slug=<slug>`):

- **Row exists** → set its **Website** cell to the live button (below) and refresh the name/trade; **leave the Data cell untouched** — it belongs to `extract-data`.
- **No row** (e.g. a dossier that predates index registration) → append one matching the existing markup, with the **Website** button and the **Data** cell as a `—` placeholder. Do **not** fabricate a Data link — it only works once the slug is in `docs/data.html`'s `SHOPS` map, which `extract-data` owns.
  Use the **Business Name** from the dossier and a short **trade** label for the primary type, matching the style of the existing rows. Cell markup:

```html
<td class="c-act">
  <a class="btn btn-site" href="webs/<slug>" target="_blank" rel="noopener"
    >Website</a
  >
</td>
<!-- Website button -->
<td class="c-act"><span class="na" title="No data extracted">—</span></td>
<!-- Data placeholder -->
```

Leave every other row untouched.

## Verify before finishing

Don't report success without checking:

- `index.html` exists and is **content-complete** (no empty or placeholder sections).
- Every `assets/…`, `css/…`, `js/…` path referenced resolves on disk, and every file in `<out>/assets/` is referenced back (no danglers either way).
- All in-page anchors and internal links resolve.
- JSON-LD reflects only visible content; absolute URLs all use `<base>` consistently.
- No fabricated **facts** anywhere — every factual claim (hours, prices, services, contact, reviews, copy) traces to the dossier; **imagery** is the sole exception, allowed only under the decorative-only guardrail below.
- Fallback imagery obeys the guardrail: `stock-*` appears only as decoration, with honest generic `alt`, never captioned/alt-texted as this venue, and absent from JSON-LD `image`. Any generated logo and every used `stock-*` are flagged in the summary as replaceable.
- Favicons/OG image were generated (or their absence was flagged); the `{{FORMSPREE_ID}}` (and `{{BASE_URL}}`, if used) placeholders are flagged.
- No tax/registration ID anywhere (no Swiss UID / `CHE-…`, VAT/TVA, or `taxID`), in visible content **or** JSON-LD.
- The footer/copyright year is produced by JS (`getFullYear()`) into an empty span — no literal year in the markup.
- Instagram is linked only when the dossier shows the profile is public; a private profile is not linked.
- `docs/index.html` has **exactly one** row for this business with a working **Website** link (`webs/<slug>`) — no duplicate row.

End with a short summary: the business, `<out>`, sections built vs. omitted (and why), any placeholders to replace before deploy, whether the branding theme was high-confidence or a **low-confidence/inferred placeholder** worth revisiting (flag it as replaceable, like a generated logo or `stock-*`), and anything the dossier lacked that would improve the site.

## Constraints & conventions

- **Swiss-French only** (`fr-CH`) — a single-locale site at the root.
- **No framework**: hand-written CSS + vanilla JS. Fonts via Google Fonts CDN (`display=swap` + preconnect).
- **Truthful content only** — omit what the dossier doesn't support; never invent reviews, hours, prices, or copy. The one exception is **imagery**: labeled fallback assets from the dossier (a generated logo, `stock-*`) may be used as **decoration only** — honest generic `alt`, never presented as the real venue, never in JSON-LD, always flagged as replaceable.
- **Never expose a tax/registration ID** — no Swiss UID / `CHE-…`, VAT/TVA number, or `taxID` anywhere on the site, neither in visible content nor in JSON-LD.
- **Social links:** only link an Instagram account the dossier shows is **public/accessible**; if it's private (or flagged private in the dossier), omit the link.
- **Year is always dynamic** — render the copyright/footer year with JS (`getFullYear()`) into an empty span; never hardcode a year in the markup.
- **Accessibility + SEO + performance per `references/best-practices.md`** — it is the bar, not a suggestion.
- **One business per invocation.** Does not commit, push, or deploy.
