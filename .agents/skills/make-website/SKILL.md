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

Invoke the **frontend-design** skill to design and implement the site (your global rule requires it for any UI). Feed it the dossier facts, the dossier's **theme** (palette, typography, `theme-color`, shape/depth/spacing, vibe), the section plan, and the `<base>` URL. Produce distinctive, production-grade output — a design unique to this business that doesn't resemble the other sites in `docs/webs/`.

**Design for genuine craft, not just difference from the other sites:**

- **Invest in one signature element a template can't produce** — a bespoke illustration, a custom icon set, a recurring graphic device, or a small piece of motion. Handcraft is what separates "designed" from "assembled". It needn't be everywhere; it must be distinctive and tied to something **true about the business**, so it reads as earned rather than decorative.
- **Make the hero specific and proof-led** — lead with copy written for this exact business and its real benefit, never generic welcome text, and surface concrete proof early: a rating, a number, a real detail — each **taken from the dossier, never invented**. Small craft touches — a slight tilt, subtle motion, a hand-drawn mark — set the tone in the first second, before anyone reads a word.

Tell it which assets are **real** (an official `logo`, `photo-*`) vs **fallback** (a generated `logo`, `stock-*`): when only fallback imagery exists, design **photo-light** — lead with brand color, type, and CSS/SVG art and icons rather than photography — and treat any `stock-*` as decorative background only (see step 6).

### 5. Write the files

Create this layout under `<out>`:

```
index.html        fr-CH homepage  (lang="fr-CH")
legal.html        fr-CH legal & privacy page, footer-linked (see site-conventions.md → Legal page)
css/style.css     hand-written CSS (no framework)
js/main.js        vanilla JS (no framework)
assets/           logo, photos, favicons, og-image (+ any decorative stock-*)
robots.txt
sitemap.xml
404.html
favicon.ico
site.webmanifest  PWA manifest, linked via <link rel="manifest"> (see site-conventions.md → Web app manifest)
```

### 6. Assets

The dossier separates **official** media from **fallback** stand-ins (a generated `logo`, `stock-*`), labeled in its Media section — carry that distinction through to the build.

- Copy the needed `logo.*` and chosen `photo-*.*` (and only the `stock-*` the design actually uses) from the dossier `<dir>/assets/` into `<out>/assets/`. Reference each with explicit `width`/`height`, `decoding="async"`, `loading="lazy"` below the fold, and `fetchpriority="high"` on the hero/LCP image (never lazy-load it).
- **Dual-format content photos** (see `site-conventions.md` → Images): emit every content photo (`photo-*`, decorative `stock-*`) as a `<picture>` with a WebP `<source>` + JPEG `<img>` fallback. Ensure both `.webp` and `.jpg` exist in `<out>/assets/`, transcoding the missing one with `convert` (libwebp), and preload the LCP photo as `type="image/webp"`. Logos/favicons/OG are exempt (next bullets). If no image tooling is available, emit a single-format `<img>` and flag it.
- **Official `photo-*`** depict the real business — their `alt`/captions may name it ("La terrasse du restaurant"). **`stock-*` are decorative stand-ins** — use them only as background/atmosphere, give them **honest, generic** `alt` that never claims to show this venue ("Ambiance de cantina mexicaine", not "Notre salle"), keep them out of JSON-LD `image`, and prefer the photo-light design (step 4) over leaning on them. Flag every `stock-*` used as replaceable placeholder imagery in the summary.
- Copy the `logo` whether real or a **generated** placeholder; a generated logo serves as the brand mark for display and as the favicon/OG source, but flag it as a generated placeholder in the summary. If the dossier has **no logo at all** (e.g. it predates the fallback step), generate a simple SVG wordmark/monogram from the name in the brand palette at build time.
- Generate from the logo, if `convert`/ImageMagick (or `sharp`) is available: `favicon.ico`, `favicon-32.png`, `favicon-512.png`, `apple-touch-icon.png`, and a `1200×630` `og-image.png`. **If no image tooling is available**, fall back to referencing the logo directly as a single favicon + OG image, and flag this in the summary.

### 7. Per-page requirements

Build `index.html` to satisfy both references read above — `best-practices.md` (generic web/a11y/SEO/performance standards) **and** `site-conventions.md` (this project's conventions + overrides, which **win on any conflict**). Apply them; don't restate them here.

### 8. Contact section

Build the contact section per `site-conventions.md` → **Contact & location**: a **contact** form (Formspree, name/email/message only) plus native `tel:`/`mailto:`/WhatsApp links and the venue address as a **Google Maps directions** link — **never a reservation/booking form, and never a "Réserver"/booking-style CTA**. Two-column (info left, form right, DOM order matching the visual order); a Google Maps embed visible on load when a map is shown. Apply it; don't restate it here. Flag the `{{FORMSPREE_ID}}` placeholder in the summary.

### 9. SEO / deploy files

Emit `robots.txt`, `sitemap.xml`, and `404.html` (all in step 5's layout) per `best-practices.md` (generic shapes) + `site-conventions.md` (project specifics — `<base>`-absolute, single-page sitemap, fr-CH `404`). Don't restate them here.

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
- Every content photo (`<picture>`) opens in the click-to-enlarge lightbox per `site-conventions.md` → **Image enlargement (lightbox)** (native `<dialog>`; logos, icons and the map iframe are excluded); the trigger is keyboard-operable and focus returns to it on close.
- Photo thumbnails in any grid/gallery **fill their cell** — the `<picture>`/`<img>` covers each `figure` with no leftover padding (a recurring bug when `aspect-ratio`/`height: 100%` is set on the `<img>` instead of the cell; see `site-conventions.md` → **Images**); spot-check the gallery at desktop and mobile.
- Consecutive sections have **distinct background tones** — no two adjacent sections share a background — drawn from the theme palette, with inverted text on any deep band and AA contrast on every band (see `site-conventions.md` → **Section backgrounds**).
- If a map is shown, the contact section matches `site-conventions.md` → **Contact & location**, and the `.map` box doesn't overflow its grid track — **verified by measuring** (`getBoundingClientRect()` width ≤ track at desktop and mid/tablet widths), not just by screenshot.
- JSON-LD reflects only visible content; absolute URLs all use `<base>` consistently.
- No fabricated **facts** anywhere — every factual claim (hours, prices, services, contact, reviews, copy) traces to the dossier; **imagery** is the sole exception, allowed only under the decorative-only guardrail below.
- Fallback imagery obeys the guardrail: `stock-*` appears only as decoration, with honest generic `alt`, never captioned/alt-texted as this venue, and absent from JSON-LD `image`. Any generated logo and every used `stock-*` are flagged in the summary as replaceable.
- Favicons/OG image were generated (or their absence was flagged); the `{{FORMSPREE_ID}}` (and `{{BASE_URL}}`, if used) placeholders are flagged.
- `site.webmanifest` exists, is linked from the homepage `<head>`, is valid JSON, and every icon `src` it lists resolves in `<out>/assets/`.
- No tax/registration ID anywhere — homepage **or** `legal.html` — (no Swiss UID / `CHE-…` / `IDE`, VAT/TVA, or `taxID`), in visible content **or** JSON-LD.
- The footer links to `legal.html`, and that legal page exists, is **fr-CH**, content-complete (no empty/placeholder sections), reuses `css/style.css`, and all its internal links resolve.
- The footer/copyright year is produced by JS (`getFullYear()`) into an empty span — no literal year in the markup.
- Instagram is linked only when the dossier shows the profile is public; a private profile is not linked.
- `docs/index.html` has **exactly one** row for this business with a working **Website** link (`webs/<slug>`) — no duplicate row.

End with a short summary: the business, `<out>`, sections built vs. omitted (and why), any placeholders to replace before deploy, whether the branding theme was high-confidence or a **low-confidence/inferred placeholder** worth revisiting (flag it as replaceable, like a generated logo or `stock-*`), and anything the dossier lacked that would improve the site.

## Constraints & conventions

- **Swiss-French only** (`fr-CH`) — a single-locale site at the root.
- **No framework**: hand-written CSS + vanilla JS. Fonts via Google Fonts CDN (`display=swap` + preconnect).
- **Truthful content only** — omit what the dossier doesn't support; never invent reviews, hours, prices, or copy. The one exception is **imagery**: labeled fallback assets from the dossier (a generated logo, `stock-*`) may be used as **decoration only** — honest generic `alt`, never presented as the real venue, never in JSON-LD, always flagged as replaceable.
- **Never expose a tax/registration ID** — no Swiss UID / `CHE-…` / `IDE`, VAT/TVA number, or `taxID` anywhere on the site — **including the legal page (`legal.html`)** — neither in visible content nor in JSON-LD.
- **Social links:** only link an Instagram account the dossier shows is **public/accessible**; if it's private (or flagged private in the dossier), omit the link.
- **Year is always dynamic** — render the copyright/footer year with JS (`getFullYear()`) into an empty span; never hardcode a year in the markup.
- **Accessibility + SEO + performance per `references/best-practices.md`** — it is the bar, not a suggestion.
- **One business per invocation.** Does not commit, push, or deploy.
