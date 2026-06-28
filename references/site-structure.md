# Site Structure

Single-page site — one HTML file, every section on one scrollable page, linked by in-page anchors. Sections run top to bottom in the order below — include every one and keep that order; omit or reorder a section only when explicitly instructed otherwise. Don't number the sections — label each heading and eyebrow by name, never with an ordinal (no "02 — L'atelier" eyebrow, no "02" section-number badge). Give consecutive sections **distinct background tones** — an alternating banded rhythm drawn from the theme palette so each section is visually separated from its neighbours, never one flat background top to bottom (see `site-conventions.md` → **Section backgrounds**).

## Header / Nav bar

Sticky top bar, present on every screen — the site's primary navigation.

- **Logo / brand** — a mark (logo image or inline SVG) plus the business wordmark; links back to the top (`#top`).
- **Anchor nav** — one in-page link per major section, in document order. Labels are themed in fr-CH, not generic — "La carte", "La maison", "Nous trouver", never "Menu"/"About". The in-view section's link is marked on scroll (scrollspy — see `best-practices.md` → `aria-current` / `IntersectionObserver`).
- **Mobile toggle** — a hamburger button revealing the nav on small screens, wired per `best-practices.md` (`aria-expanded`, `aria-controls`, `aria-label`).

_No CTA button in the header — keep the bar minimal. The actual CTAs live in the hero, between sections._

## Hero

- **Eyebrow / overline** — tiny context label above the headline; a `Catégorie · quartier · Genève` kicker — "Café · Bar — Plainpalais, Genève", "Épicerie bio & santé · Jonction, Genève" — sometimes carrying a since-year ("depuis 1985", "Est. 2019"). Prefix it with an icon only when one clearly fits the business (e.g. a sprout for a bio épicerie) and is simple enough to read at that tiny size — a clean single-shape glyph, never a detailed mark or one with text/lettering in it; if none qualifies, show the text alone rather than force a generic, busy, or off-theme one.
- **Headline** — the one big promise, and the page's main SEO heading (`<h1>`); large display type. Written in fr-CH; it names the offering and, where it reads naturally, ties it to Geneva or the quartier ("Le Portugal fait maison, à la Jonction.", "Pizza au feu de bois & cuisine italienne à Genève") — but don't force a place in when the line is stronger without it ("Les matins ont meilleur goût ici."). Often broken across lines with `<br>` or accenting one highlighted word.
- **Subhead / lede** — usually a single sentence (two at most) expanding the promise; packs the specifics — signature products, since-year, neighborhood — in the brand's own voice.
- **CTAs** — one primary + one secondary button, themed in fr-CH and text-only — no icons in the buttons. Primary is the contact action ("Nous contacter", "Appeler le salon", "Prendre contact"); secondary points at the offering ("Voir la carte", "Voir les produits", "Découvrir la collection"). _Contact wording only — never "Réserver"/"Prendre rendez-vous" (see `site-conventions.md` → **CTA labels**)._
- **Trust / meta strip** — a tight, divider-separated row, filled in priority order: rating, then TripAdvisor rating, then the live open/closed status chip. Each rating (stars + score) shows only when it's above 4/5 — the first from whatever source the dossier has (typically Google), the second from TripAdvisor; a missing or sub-4/5 score is dropped, not shown. When a rating slot can't be filled, the address takes its place (shown once, even if both ratings are missing). The live open/closed status chip (JS-rendered from the opening hours; see `site-conventions.md` → **Open/closed status chip**) is always present, last.
- **Visual** — the LCP hero photo (loaded per `site-conventions.md` → **LCP photo**), usually paired with decorative SVG — a seal, brush stroke, scattered doodles, or a script-character watermark; occasionally a small multi-photo collage instead of a single image. If the dossier has an official logo or logomark that sits cleanly over the photo, overlay it small in the bottom-left corner of the image; omit it when it doesn't read well there.

## Services / Menu / Products

The first content section after the hero and the page's centre of gravity: a clear, scannable account of what the business offers. There's no single template — name and shape it to the trade: a **carte** (food), a grid of **produits / rayons / collections** (shops), a list of **prestations / soins** (services), a **collection** (second-hand). The nav links to it with a themed fr-CH label — "La carte", "La table", "Produits", "Les soins", "Le métier", "La collection".

- **Section head** — an eyebrow that echoes the nav label or sets the scene ("La carte", "Au comptoir", "Nos rayons", "Nos prestations"); an evocative fr-CH `<h2>`, never the bare word "Menu" ("Tout droit sorti du four", "À midi, on passe à table.", "Les spécialités de la maison", "Dim sum, douceurs & thés"); and a one- to two-sentence lede in the brand's voice — what's made, "fait maison", service hours, dishes "à partager".
- **Layout — fit the trade, don't force one template.** Three base shapes recur: items grouped under a few **named categories** ("Pour commencer", "Les classiques", "Spécialités", "Douceurs & bar"); a **flat list of dish / product _families_** (one elegant card, or a classic dotted-leader list — the leader running to a tag, never to a price); or a **grid of icon cards** — each a department/family with a line-art SVG glyph, a title, and one sentence — the default for shops and service businesses with no fixed menu ("rayons", "collections", "soins"). Richer variants seen across the sites: a day-to-night split, chalkboard "boards", or a single **signature item** given a spotlight.
- **Food / drink menus** — the go-to shape is a **named-category carte**: a two-column grid of a few category blocks ("Le salé", "La boulangerie", "La pâtisserie", "Au comptoir"), each a heading (optionally with a small glyph) over a hairline-divided list of dishes. Every dish is a **name + one warm, descriptive line**, plus the occasional inline tag ("spécialité", "maison", "chaque jour") — editorial, never a spec sheet. **When the carte runs long, split the categories into tabs** instead of one endless scroll: a row of category buttons above the list, only the selected category's **panel shown at a time**, swapped on click with a quiet fade and the first category open on load. Wire the buttons accessibly (a `tablist` of `tab`s controlling `tabpanel`s with `aria-selected`, or buttons with `aria-pressed`) and degrade to the full list when scripting is off.
- **Each item** — a **name + a short description** in the brand's voice, always. Add a small **tag** only to flag a signature or notable item ("Signature", "Maison", "Le classique", "Végé") — sparingly, one or two per list, never a full dietary-marker system.
- **No prices here — keep the section price-free.** No per-item prices, no price list, no ranges or "à partir de" / "dès …" figures — not even for a barber or a fixed café carte. Pricing is addressed only by the closing note's polite deferral to the shop or a direct contact (below), never inline against an item. _(No durations either — drop any "30 min"-style label; even the barber and groomer show none.)_
- **No images here — text and icon only.** The section shows **no photos** — no per-item photos, no captioned photo tiles, no hero-style imagery. The only graphics are the decorative line-art **SVG glyphs / icons** (card marks, bullets, eyebrow glyphs) — never a photograph. The real dish / product / work photos belong to the **About** photo gallery, not this section.
- **Closing note** — a small footnote usually ends the list, carrying the **pricing posture** (always a deferral, never a figure: "Les prix sont affichés en boutique", "communiqués au comptoir", "Pas de tarifs en ligne", a "devis personnalisé" for quote-based services), the **living-menu caveat** ("carte indicative", "elle évolue au fil des saisons", "au fil des arrivages"), and any **payment / service facts** ("Cartes acceptées", "Espèces uniquement", "À emporter, livraison, sur place", "Sans rendez-vous").

_No prominent CTA button inside this section — the "see the offering" CTA lives in the hero and scrolls in (see **Hero**). The section closes on its note. Any link here stays contact- or offering-worded, never "Réserver" (see `site-conventions.md` → **CTA labels**)._

## About

The brand's story — the major content block after Services and the page's credibility centre. The nav links to it with a themed fr-CH label drawn from the trade and the place — "La maison" (the default, fits almost any business), "La boutique", "L'atelier", "Le salon", "L'ambiance", "Notre histoire" — never "À propos"/"About". The usual shape is a two-column **about-grid**: a copy column carrying the story beside a visual column carrying a feature photo, a small collage, or the gallery itself.

- **Section head** — an eyebrow echoing the nav label, occasionally prefixed with a small line-art glyph (a swirl, a dot, a star); and an evocative fr-CH `<h2>`, never the bare "À propos" ("Une maison de famille", "Une table italienne à la Jonction", "Un coin de Chine, rue des Bains", "Un salon à taille humaine, tenu avec cœur"). An opening **lede**, set larger than the body, often leads the story.
- **Story** — two or three short paragraphs in the brand's voice: where it sits (quartier + street — "Au cœur de la Jonction", "boulevard Carl-Vogt"), who's behind it (the named owner or family, with a since-year where there is one), what it makes and how ("fait maison", "au feu de bois", "à la main"), and the feel of the place — the room, the materials, the welcome. A signature detail often closes it. Keep it specific to the dossier — no generic "passion & quality" filler, and keep the rating out of the prose (scores live in the hero trust strip and Reviews, not the story).
- **Team** — usually the **people woven into the story prose** as a named owner or family ("menée par Christophe Dubois", "tenue par Aamir Ali", "tenu par Alexandra"), not a separate roster. A dedicated **team module** — small cards with an initials avatar, a name and a role — is the exception, for co-owners worth crediting side by side ("Catherine Ryser · Associée-gérante"). A signed **sign-off** is a common lighter touch in the same spirit ("Avec soin, Alexandra · Toiletteuse", "— à demain matin ☕"). Name only who the dossier supports; prefer prose to a thin one-person "team", and never invent people.
- **Feature chips** — a compact strip of practical amenity chips, each a short fr-CH label carrying **its own small line-art icon**, ideally one that depicts the amenity (a wheelchair, a Wi-Fi arc, a terrasse, a paw, a payment card); fall back to a plain check only when no fitting glyph exists. Chips are the **only** highlights shape here — no stat / big-number blocks, no definition lists. Draw them from the dossier's practical facts: accessibility ("Accès fauteuil roulant"), Wi-Fi, parking, payment methods ("Cartes acceptées", "Paiement sans contact"), climatisation, terrasse, livraison, à emporter, animaux admis, "LGBTQ+ friendly" — and the like (not limited to these). **Never chip a rating, a location / quartier, or a price** — ratings belong to the hero trust strip and Reviews, the address to the Location section, and pricing stays a deferral in the Services closing note.
- **Photo gallery** — the section's visual payload and the page's **only home for real photography** (Services is text-and-icon only; its dish / product / work photos live here). A **mosaic grid of `<figure>`s** — usually one larger "feature" tile among smaller ones — each a dual-format `<picture>` per `site-conventions.md` → **Images** (WebP + JPEG, explicit `width`/`height`, `loading="lazy"`, `decoding="async"`, a descriptive fr-CH `alt`) and usually a short, evocative **`<figcaption>`** ("La devanture, boulevard Carl-Vogt", "Théières de Yixing", "Repulgue tressé à la main") — captions sometimes `sr-only` on tight collages. Every photo is click-to-enlarge per `site-conventions.md` → **Image enlargement (lightbox)**. Subjects: the space, the storefront, the products / dishes, the work — and, where the trade calls for it, a different cast (a groomer's freshly-clipped "Portraits", a hatter's market étal). Typically 3–9 photos.
  - **Placement varies** — folded into the about-grid's visual column, stacked **below** the story under a small "En images" sub-head, or **promoted to its own standalone section** right after, with its own eyebrow + `<h2>` and its own nav link ("Galerie", "Portraits"). Promote it when the photo set is strong enough to stand alone (a restaurant's plates, an artisan's pieces); fold it in when it's a supporting accent.

## Reviews

Build trust through social proof.

- **Heading.**
- **Aggregate rating** — stars + review count.
- **Quotes** — a few short testimonials, each attributed to a named person.

## Location

- **Address & map** — where to find the business.
- **Opening hours.**
- **Phone & email.**
- **Access** — parking and transport.

## Contact

The primary conversion point.

- **Contact form** — name, email, and message only. Never a reservation/booking widget or appointment picker, even for businesses that take bookings.
- WhatsApp / call button.

## Footer

- **Brand block** — logo + one-line description; _restates identity at the bottom._
- **Contact / location** — address, phone, opening hours; _the #1 thing local-business visitors hunt for._
- **Secondary navigation** — repeat of the main section links; _for people who scrolled to the end._
- **Social / external links** — Instagram, Facebook, Google Maps/reviews. _(Only link an Instagram profile the dossier shows is public — omit it if private.)_
- **Closing touches** — a dynamic copyright year (JS-rendered, never hardcoded), a **VitrinePro credit** sign-off (its link target is fixed by `site-conventions.md` → **Footer credit**), and a **"Mentions légales" link** to the site's legal page (`legal.html`, opened with `target="_blank" rel="noopener"`; see `site-conventions.md` → **Legal page**); sometimes a final CTA. _(No back-to-top link — the sticky header and logo already return to the top. Keep the editor details and any privacy/cookie text on the legal page itself, not inline in the footer; never put a company-registration or tax ID anywhere.)_
