# Site Structure

Single-page site — one HTML file, every section on one scrollable page, linked by in-page anchors. Sections run top to bottom in the order below — include every one and keep that order; omit or reorder a section only when explicitly instructed otherwise.

## Header / Nav bar

- **Logo** — links back to the top.
- **Anchor nav** — links to each section on the page (the site's primary navigation).

## Hero

- **Eyebrow / overline** — tiny context label above the headline; short kicker text, often with an icon.
- **Headline** — the one big promise, and the page's main SEO heading (`<h1>`); large display type.
- **Subhead / lede** — one or two sentences expanding the promise; a short paragraph.
- **CTAs** — the action(s) you want taken: one primary + one secondary button (see menu, call us, get a quote, contact us, etc.).
- **Trust / meta strip** — quick credibility or key facts: rating, address, hours, badge.
- **Visual** — photo, illustration, or decorative shapes (image or SVG).

## Services / Menu / Products

A clear, scannable list of what the business offers.

- Each item shows a name and short description.
- Price, and duration where relevant.

## About

- **Story** — who the business is and the place itself.
- **Team** — the people.
- **Certifications & trust signals** — credentials and proof.
- **Photo gallery** — images of the work, space, or products.

## Contact

The primary conversion point.

- **Contact form** — name, email, and message only. Never a reservation/booking widget or appointment picker, even for businesses that take bookings.
- WhatsApp / call button.

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

## Footer

- **Brand block** — logo + one-line description; _restates identity at the bottom._
- **Contact / location** — address, phone, opening hours; _the #1 thing local-business visitors hunt for._
- **Secondary navigation** — repeat of the main section links; _for people who scrolled to the end._
- **Social / external links** — Instagram, Facebook, Google Maps/reviews. _(Only link an Instagram profile the dossier shows is public — omit it if private.)_
- **Closing touches** — a dynamic copyright year (JS-rendered, never hardcoded), a **VitrinePro credit** sign-off (its link target is fixed by `site-conventions.md` → **Footer credit**), and a **"Mentions légales" link** to the site's legal page (`legal.html`, opened with `target="_blank" rel="noopener"`; see `site-conventions.md` → **Legal page**); sometimes a final CTA. _(No back-to-top link — the sticky header and logo already return to the top. Keep the editor details and any privacy/cookie text on the legal page itself, not inline in the footer; never put a company-registration or tax ID anywhere.)_
