---
name: extract-data
description: >-
  Enrich a single Geneva business by gathering publicly-available data in parallel from many web sources, then write a structured markdown dossier (with downloaded logo/photos) to data/<slug>/ and register the business in the portfolio index (docs/index.html). Use when the user wants to collect, enhance, or research all available information about a specific shop/business — name, address, hours, ratings, reviews, services/menu, prices, photos, social links, branding (colors/fonts), etc. This is step 2 (“enhance”) of the websites pipeline: extract → enhance → build.
---

# extract-data

Gather everything publicly available about **one** Geneva business and write it to a structured markdown dossier under `data/<slug>/`, with the logo and photos downloaded into an `assets/` subfolder. The dossier feeds the downstream website build.

**Scope:** this skill ends when the dossier is written **and the business is registered in the portfolio index** (`docs/index.html`, plus the `docs/data.html` dossier-viewer allow-list). It does **not** build the website. **One business per invocation** — the caller iterates over a business list. **Paths** are relative to the repo root (the working directory), not this skill folder: `references/` and `resources/` live at the repo root and are shared with `make-website`.

## Inputs

Accept the shop info from the skill arguments or by asking the user. Parse whatever free-form details are given (name, address, website, phone, etc.).

**Google Maps URL shortcut.** The user may instead (or also) paste a **Google Maps link** — a full `…google.com/maps/place/…` URL or a short `maps.app.goo.gl/…` / `goo.gl/maps/…` link. Treat it as the identity seed: step 1 resolves it, parses name/coordinates from the URL, and best-effort extracts the listing (address, phone, website, hours, category), so the user usually needn't type those.

**Google-Maps-Scraper record (JSON).** The user may instead provide a single **Apify Google-Maps-Scraper record** — the JSON object shape used in `docs/map/assets/<type>.json` (fields like `title`, `categoryName`, `address`, `location`, `openingHours`, `totalScore`, `imageUrls`, `instagrams`, …). It is the richest seed: a pre-fetched Google listing that hands step 1 the name, type, address, coordinates, phone, hours, ratings, photos, and socials directly, so it ingests the record instead of resolving a Maps URL. Pass it inline or as a path to a one-record `.json`. **One business per invocation** — if an array of more than one entry (e.g. a whole category file) is given, **stop the process**: the skill does not batch and won't pick one for you. (A single-element array is just that one record.)

**Required to proceed:** business **name**, that it is in **Geneva, Switzerland**, and its **type(s)** (from the `resources/businesses.txt` taxonomy, e.g. `Barber Shop`, `Restaurant`). Ask the user **only** for whichever of these is missing — don't interrogate field-by-field. A Google Maps URL usually supplies the **name** and confirms **Geneva** (via coordinates), so often only the **type(s)** needs inferring/confirming.

Everything else is optional and just improves matching.

## Procedure

### 1. Collect & confirm identity

**If the input is a Google-Maps-Scraper record (JSON), ingest it directly** — skip the Maps-URL steps below; the record already carries the listing. Map only the in-scope fields into the shop record and into a pre-filled source result named `Google Maps (record)` (shaped like the step-4 `SCHEMA`, with `access_status: "ok"`):

- `title` → **name** (canonical); `categoryName` + `searchString` → **type(s)**, mapped to the `resources/businesses.txt` taxonomy (e.g. `Hair salon` / "hair salon" → `hair_salon`).
- `address` (or `street` + `postalCode` + `city`) → **address**; `location {lat,lng}` → **coordinates** — **validate** they fall in the Geneva area (≈ lat 46.1–46.3, lng 6.0–6.3); if not, flag it (the pipeline is Geneva-only).
- `phone` / `phoneUnformatted` / `phones` → **phones**; `emails` → **emails**; `website` → **website**.
- `openingHours` (`[{day,hours}]`) → **opening_hours**; `permanentlyClosed` / `temporarilyClosed` → **status**.
- `totalScore` + `reviewsCount` + `reviewsDistribution` → **rating** (`score`, `scale: 5`, `count`); `reviews[]` → **reviews** — often populated with full review objects: map each entry's `name` → author, `publishedAtDate` → date, `stars` → rating, `text` (the **original-language** field, **not** `textTranslated`) → excerpt, `reviewUrl` → url. The fan-out may add more, so dedupe in the merge (step 5).
- `imageUrl` / `imageUrls` → **photo_urls**; `instagramProfiles[].profilePictureURL`, when present → **logo_url** candidate.
- `instagrams` / `facebooks` / `twitters` / `youtubes` / `tiktoks` / `linkedIns` / `pinterests` → **social_links**; `menu` / `servicesLink` → **services**.
- `additionalInfo` (payments, parking, amenities, planning) → **notes** (FAQ-useful extras); keep `scrapedAt` as a staleness marker.
- **Drop (out of scope):** `placeId` / `cid` / `fid` / `kgmid` (stable platform IDs), `price` (price level), `peopleAlsoSearch`.

The record supplies name, Geneva, and type(s), so do **not** ask the user for identity and do **not** run the Maps-URL or pin-identity resolution passes. The pre-filled `Google Maps (record)` source is carried into the merge (step 5), and the live Google source is dropped from the fan-out (step 3).

**Otherwise, if the input is (or contains) a Google Maps URL, resolve and extract it first:**

1. **Resolve short links.** For `maps.app.goo.gl/…` or `goo.gl/maps/…`, follow redirects to the canonical place URL — e.g. `curl -sIL -o /dev/null -w '%{url_effective}' "<short-url>"` (or WebFetch, which follows redirects).
2. **Parse the URL string** (reliable, no page render needed):
   - **Name** — the `/place/<Name>/` segment (URL-decode; `+` → space).
   - **Coordinates** — `@<lat>,<lng>,…` or the `!3d<lat>!4d<lng>` data params.
   - **Validate** the coordinates fall in the Geneva area (≈ lat 46.1–46.3, lng 6.0–6.3); if not, flag it — the pipeline is Geneva-only.
3. **Extract the listing (best-effort).** Fetch the resolved place page for **address, phone, website, opening hours, category, rating**. Google Maps is JS-rendered and bot-protected, so if the fetch is blocked or thin, fall back to a **web search** for the place (parsed name + "Geneva" + street) and read the Google knowledge-panel details. Capture whatever is available, tagged source **"Google Maps (URL)"**. Do **not** fail if blocked — the fan-out's Google source agent (step 4) re-extracts and corroborates, so this is a head-start, not a single point of failure.
4. **Map the category → taxonomy type.** Translate the Google category (e.g. "Barber shop", "Coffee shop") to the `resources/businesses.txt` type(s); propose it and let the user confirm. If no category was obtained, ask the user for the type(s) only.

Assemble a shop record (seeding it with everything the Maps URL provided, if any):

```
{ name, types: [...], address?, website?, phones?, emails?, notes? }
```

If name, Geneva, or type(s) are missing, ask once for the missing piece. Do not ask for anything else. Build the output **slug** = `<name>_<type>` — the business name and its **primary type** (`types[0]`), each kebab-cased with accents ASCII-folded and punctuation dropped, joined by a single underscore (the only `_` in the slug, so name and type stay separable). E.g. `Café Crémerie` (Coffee Shop) → `cafe-cremerie_coffee-shop`; `Le Chat Noir` (Bar / Pub) → `le-chat-noir_bar-pub`.

**Pin the identity before fanning out.** If neither address nor website is known, first do a quick resolution pass — search Google Business Profile / Maps and local.ch for the name + "Geneva" + type — to lock the canonical address (and website, if found), then add it to the shop record so every source agent matches against the same business. If it can't be resolved confidently, proceed anyway but treat matching as lower-confidence and flag ambiguous results in the merge. The canonical **website**, if found, is also the primary source for the **branding theme** (step 8), so resolving it pays off twice.

### 1b. Check for an existing official website (early gate)

This pipeline builds a site for businesses that **don't already have a working one**, so before sinking any effort into the gather, find any **own official website** the business may already have — and if one exists, let the **user** judge whether it works and whether to go on. Do this **first**, right after identity is pinned.

1. **Search hard for an own-site.** Start from anything step 1 already surfaced (the Maps listing's `website`, the pin-identity pass). If no site is known yet, look specifically for one and try as hard as public web search reasonably allows before concluding there is none: web-search the name + "Genève" + type(s); read the website field on the Google Business Profile / Maps listing; check the business's local.ch (and other directory) listings for an outbound site link; check the Facebook / Instagram bio for a linked site.

2. **Keep only a genuine own-site.** A directory or aggregator listing (local.ch, Yelp, Tripadvisor, …), a social-media profile (a Facebook / Instagram page), a Linktree, and a booking / marketplace page are **not** official websites — they do not trip the gate. Only the business's **own** site does (its own domain, self-hosted content).

3. **No own-site found → continue as usual.** Leave `shop.website` unset and proceed to step 2. This is the expected case — most targets are website-less.

4. **An own-site found → ask the user; don't judge it yourself.** Best-effort fetch the candidate and note what you saw (loads normally / 404 / parked / hosting-error / empty shell), then call the **AskUserQuestion** tool — **showing the exact URL** and your observation — to let the user decide whether the site is **working (available and reachable)** or **broken**, and how to proceed. Three outcomes:
   - **Broken** — the site is down, parked, lapsed, or errored, so the business effectively has no site: continue building as usual and leave `shop.website` unset.
   - **Working — build anyway** — the site is live, but build the dossier regardless. Seed `shop.website` with the URL (it then feeds the official-website source in steps 3, 4, 4b, 5 and the branding theme in step 8) and proceed to step 2.
   - **Working — abort** — the site is live, so the business already has a website: stop the skill immediately — run nothing further, write no dossier — and report the abort with the URL.

### 2. Read the source reference

Read `references/data-extraction.md` in full. It catalogs every source, its Geneva coverage, the fields it exposes, and its access method/ToS notes.

### 3. Build the source list

Select the sources to query for **this** shop:

- **The shop's own official website** (when `shop.website` is known) — add it as the **first** source, named `Official website`, queried with the full per-source schema. It is the **top-authority** source for self-reported facts (hours, services, menu, prices, contact, social, logo/photos) and is **not** in `data-extraction.md`. Set its `access_notes` to flag its nature, e.g. _"The business's OWN site — most authoritative for self-reported hours/services/menu/prices/contact; extract comprehensively."_ A separate `branding:website` agent reads the same site for the visual theme (step 8), so this agent focuses on facts/content.
- **All Generic sites** with plausible Geneva coverage for this business (skip ones whose coverage note says this type won't appear).
- **All category-specific sites** for the shop's type(s). Map type → category using `resources/businesses.txt` (its category headers match the `## <Category>` sections in `data-extraction.md`); if the shop has multiple types spanning categories, include all matching category sections.

**The list is closed to those three** — `data-extraction.md` entries plus the official website, nothing else. Do **not** add off-doc sources to "confirm" the business; in particular, **never add a commercial-registry / legal-identity lookup** (Zefix, UID-Register / BFS-FSO, moneyhouse.ch, the cantonal Registre du commerce, Kompass, …). Registered legal name, UID/CHE, VAT, legal form, capital and registry status are **out of scope** (step 4), so such a source can only return discardable data — it earns no agent and just wastes the call.

Then dedup — the doc is already curated to only valid, reachable sources, so this step removes just **contextual** redundancy, not invalid sources:

- **Drop redundant aggregators** when a primary source they re-publish is already in the list (the doc flags these, e.g. yellowpages.swiss, companyfinder.ch, Restaurant Guru, infoisinfo). **Exception for website-less targets:** when the only primary an aggregator re-hosts is a login-walled Facebook/Instagram page (so its photos aren't reachable any other way), keep the aggregator — it may be the sole reachable copy of those images (e.g. Restaurant Guru re-publishes Google/Facebook photos). Tag anything taken this way with the aggregator as the source.
- **When a Google-Maps-Scraper record was provided** (step 1): drop the live **Google Business Profile / Maps** source — the record stands in for it and is folded into the merge as `Google Maps (record)`. Every other source still runs (full pipeline).

The result is typically ~15–30 sources. For each, keep: `{ name, url, access_notes }` (url = the source's site or its Geneva page if the doc gives one; access_notes = the doc's access/ToS line).

Do **not** pause for confirmation — proceed straight to the fan-out.

### 4. Fan out — one agent per source (Workflow tool)

Call the **Workflow** tool with the script below, passing `args = { shop, sources }`. Each source gets one independent, schema-validated agent. (Invoking Workflow here is expected — this skill instructs it.)

```javascript
export const meta = {
  name: "extract-data-gather",
  description:
    "Fan out one web-research agent per source to gather data about one Geneva shop",
  phases: [{ title: "Gather", detail: "one agent per source" }],
};

// `args` may arrive as a JSON string rather than a parsed object — guard for both.
const _args = typeof args === "string" ? JSON.parse(args) : args;
const { shop, sources } = _args;

// Per-source structured return. Every field nullable — a source rarely has all of them.
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["source", "access_status"],
  properties: {
    source: { type: "string" },
    source_url: {
      type: ["string", "null"],
      description: "The exact page used, if any",
    },
    access_status: {
      type: "string",
      enum: ["ok", "partial", "blocked", "not_found", "no_data", "error"],
      description:
        "ok=found+extracted, partial=some data, blocked=bot-blocked/403, not_found=business not listed, no_data=listed but empty, error=agent failed (set by the merge, not the source agent)",
    },
    status: {
      type: ["string", "null"],
      enum: [
        "operational",
        "temporarily_closed",
        "permanently_closed",
        "unknown",
        null,
      ],
      description:
        "Use these exact tokens; the merge renders them with spaces in the dossier.",
    },
    types: { type: "array", items: { type: "string" } },
    name: { type: ["string", "null"] },
    website: { type: ["string", "null"] },
    emails: { type: "array", items: { type: "string" } },
    address: { type: ["string", "null"] },
    coordinates: {
      type: ["object", "null"],
      additionalProperties: false,
      properties: { lat: { type: "number" }, lng: { type: "number" } },
    },
    phones: { type: "array", items: { type: "string" } },
    opening_hours: {
      type: ["string", "null"],
      description: "Per-day hours as text; preserve source format",
    },
    rating: {
      type: ["object", "null"],
      additionalProperties: false,
      properties: {
        score: { type: ["number", "null"] },
        scale: { type: ["number", "null"], description: "e.g. 5 or 20" },
        count: { type: ["integer", "null"] },
      },
    },
    reviews: {
      type: "array",
      description: "Up to ~5-10 of the most positive (highest-rated) reviews",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          author: { type: ["string", "null"] },
          date: { type: ["string", "null"] },
          rating: { type: ["number", "null"] },
          excerpt: { type: ["string", "null"] },
          url: { type: ["string", "null"] },
        },
      },
    },
    services: {
      type: "array",
      description: "Services / products / menu items",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          description: { type: ["string", "null"] },
          price: { type: ["string", "null"] },
        },
      },
    },
    logo_url: { type: ["string", "null"] },
    photo_urls: { type: "array", items: { type: "string" } },
    social_links: {
      type: ["object", "null"],
      description:
        "Map of network -> URL (facebook, instagram, x, tiktok, linkedin, youtube, ...)",
      additionalProperties: { type: "string" },
    },
    notes: {
      type: ["string", "null"],
      description: "Anything else relevant, or caveats",
    },
  },
};

// Branding theme, read from the shop's OWN website (one dedicated agent).
// Every field nullable — most sites expose only some of it.
const BRANDING_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["access_status"],
  properties: {
    source_url: {
      type: ["string", "null"],
      description: "The exact website page inspected",
    },
    access_status: {
      type: "string",
      enum: ["ok", "partial", "blocked", "not_found", "no_data", "error"],
      description:
        "ok=branding extracted, partial=some, blocked=bot-blocked, not_found=no reachable site, no_data=site has no discernible styling",
    },
    palette: {
      type: "array",
      description: "Colors the site uses, each mapped to a semantic role",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["role", "hex"],
        properties: {
          role: {
            type: "string",
            description:
              "primary | accent | background | surface | text | muted | border | other",
          },
          hex: { type: "string", description: "#rrggbb" },
          note: {
            type: ["string", "null"],
            description:
              "where seen, e.g. 'CSS --brand', 'button bg', 'body color'",
          },
        },
      },
    },
    typography: {
      type: ["object", "null"],
      additionalProperties: false,
      properties: {
        display: {
          type: ["string", "null"],
          description: "Heading/display font-family as written in the CSS",
        },
        body: {
          type: ["string", "null"],
          description: "Body font-family as written in the CSS",
        },
        loaded_via: {
          type: ["string", "null"],
          description:
            "Google Fonts | self-hosted @font-face | system stack | other",
        },
      },
    },
    theme_color: {
      type: ["string", "null"],
      description: 'The <meta name="theme-color"> value if present',
    },
    shape: {
      type: ["object", "null"],
      additionalProperties: false,
      properties: {
        radius: {
          type: ["string", "null"],
          description: "dominant border-radius, e.g. '8px', 'pill', 'sharp/0'",
        },
        borders: {
          type: ["string", "null"],
          description: "border character, e.g. 'hairline 1px', 'none', 'bold'",
        },
      },
    },
    depth: {
      type: ["string", "null"],
      description:
        "shadow/elevation character, e.g. 'flat/none', 'soft diffuse', 'hard offset'",
    },
    spacing: {
      type: ["string", "null"],
      description:
        "layout density, e.g. 'airy/generous', 'balanced', 'compact'",
    },
    vibe: {
      type: "array",
      items: { type: "string" },
      description: "3-5 adjectives for the overall visual personality",
    },
    notes: { type: ["string", "null"] },
  },
};

phase("Gather");

const thunks = sources.map(
  (s) => () =>
    agent(
      [
        "You research ONE business and extract structured data from ONE source. Return ONLY what THIS source shows.",
        "",
        "BUSINESS:",
        `- Name: ${shop.name}`,
        "- City: Geneva, Switzerland",
        `- Type(s): ${(shop.types || []).join(", ")}`,
        `- Known address: ${shop.address || "unknown"}`,
        `- Known website: ${shop.website || "unknown"}`,
        `- Other known info: ${shop.notes || "none"}`,
        "",
        `SOURCE: ${s.name}${s.url ? " — " + s.url : ""}`,
        `Reference access notes: ${s.access_notes || "none"}`,
        "",
        "RULES:",
        "- Web only: use web search + public page fetches. Do NOT use paid or credentialed APIs and never invent or use credentials — but where THIS source exposes a free keyless endpoint (e.g. Overpass/Nominatim for OpenStreetMap at <=1 req/s), prefer it over scraping the source's HTML. Don't substitute a different source's API for the one you're assigned.",
        "- Pragmatic best-effort: if the page loads, extract it; do NOT attempt anti-bot bypass (proxies, UA rotation).",
        "- If the source blocks you, the business is not listed, or the page is empty, report it via access_status and stop — don't guess.",
        "- Match carefully: confirm name + Geneva (+ address/website if known) so you extract the RIGHT business.",
        "- Preserve original language; do NOT translate names, services, or menu text.",
        "- Mine STRUCTURED METADATA for image URLs, not just rendered markup: JSON-LD (`schema.org` `logo`/`image`), `og:image`/`twitter:image`, and `<link rel=icon>` often expose clean absolute logo/photo URLs even when the visible HTML hides them.",
        "- Logo/photos: return absolute image URLs only (resolve relative paths against the page URL); do NOT download anything. Photos: up to ~15 representative ones.",
        "- Reviews: at most ~5-10, and only the most positive (highest-rated) ones — skip critical/negative reviews.",
        "- Also capture FAQ-useful extras when the source shows them — payment methods, parking/access, accessibility, age limits, booking/deposit policy, founding year — in `notes`.",
        "- Do NOT collect these (out of scope): legal/registry identity (registered legal name, UID/CHE, VAT or tax number, legal form, capital) — so do NOT query a commercial registry (Zefix, UID-Register/BFS, moneyhouse.ch, the cantonal Registre du commerce) to obtain it; stable platform IDs (Google place_id/CID, EGID, etc.); or an overall price level / price range (e.g. '$$', 'CHF 30-60 per person'). Staff size/headcount is also out of scope. Itemized prices for specific products/services ARE wanted: attach them to the relevant `services` entry.",
        "- Do NOT merge in knowledge from other sources or your own memory; only this source.",
      ].join("\n"),
      {
        label: `src:${s.name}`,
        phase: "Gather",
        schema: SCHEMA,
        model: "sonnet",
      },
    ),
);

// The shop's OWN website is the primary branding source — one dedicated agent
// joins the same fan-out, run only when a canonical website was resolved.
if (shop.website) {
  thunks.push(() =>
    agent(
      [
        "You extract the VISUAL BRAND IDENTITY of ONE business from its OWN official website. Report ONLY what the site's markup/CSS actually shows.",
        "",
        "BUSINESS:",
        `- Name: ${shop.name}`,
        "- City: Geneva, Switzerland",
        `- Type(s): ${(shop.types || []).join(", ")}`,
        `- Website to inspect: ${shop.website}`,
        "",
        "WHAT TO EXTRACT (from HTML + linked CSS — do NOT execute JS, do NOT process images):",
        "- Palette: the colors the site actually uses. Prefer CSS custom properties (:root { --… }); else prominent color / background-color / border-color declarations. Map each to a role — primary (brand), accent (CTA/links), background, surface (cards/raised), text, muted, border — and give #rrggbb.",
        "- Typography: the heading/display and body font-family values; note how they load (Google Fonts <link>, self-hosted @font-face, or a system stack).",
        '- theme-color: the <meta name="theme-color"> value, if any.',
        "- Shape: dominant border-radius (e.g. 8px / pill / sharp) and border character.",
        "- Depth: shadow/elevation style (flat, soft diffuse, hard offset).",
        "- Spacing: overall density (airy / balanced / compact).",
        "- Vibe: 3-5 adjectives for the visual personality (e.g. minimal, luxe, playful, rustic).",
        "",
        "RULES:",
        "- Confirm it is THIS business's own site (name + Geneva) before trusting it.",
        "- Report only what THIS site shows; do NOT infer from the logo, the name, or other sites — that is the main agent's job.",
        "- Preserve exact hex values and exact font-family names; do not normalize or translate.",
        "- If the site is unreachable, blocked, or has no discernible styling, say so via access_status and stop — do not guess.",
      ].join("\n"),
      {
        label: "branding:website",
        phase: "Gather",
        schema: BRANDING_SCHEMA,
        model: "sonnet",
      },
    ),
  );
}

const all = await parallel(thunks);
const branding = shop.website ? all[all.length - 1] : null;
const results = all.slice(0, sources.length);

// Keep every source represented and correctly attributed in the appendix,
// even when its agent died (parallel() yields null for a thrown thunk).
return {
  perSource: sources.map((s, i) =>
    results[i]
      ? {
          ...results[i],
          source: s.name,
          source_url: results[i].source_url ?? s.url ?? null,
        }
      : { source: s.name, source_url: s.url ?? null, access_status: "error" },
  ),
  branding,
};
```

### 4b. Render assist — no-login browser (main agent)

After the fan-out returns, recover data a plain fetch missed from **public, JS-rendered** sources using the committed headless-browser helper. This is a best-effort fetch of a **public** page — **no login, no anti-bot bypass**, the same posture as `curl` but with a JS engine — so it does **not** reach login-walled content (Facebook/Instagram photo tabs stay out of scope by design). It runs in the **main agent** only (the fan-out sub-agents have web tools, not a browser).

Run it for:

- **The official website**, when its `Official website` agent came back `blocked`/`no_data` or visibly thin (an empty SPA shell) — re-extract self-reported facts (hours, services/menu, itemized prices, contact, social links) from the rendered DOM, and capture branding for step 8.
- **Any selected source flagged "JS-rendered"** in `data-extraction.md` (e.g. SFF Member Register, Caran d'Ache locator) that returned empty.

Skip it when the cheap fetch already yielded good data — it is a targeted fallback, not a default pass.

```sh
node .agents/skills/extract-data/scripts/render.mjs <url>   # → JSON { facts, branding }
```

One-time setup (Chromium may already be cached): run `npm install && npx playwright install chromium` in `scripts/` — see `scripts/README.md`. The JSON carries rendered **facts** (`title`, `metas`, `jsonLd`, `bodyText`, `links`) and **branding** (computed-style palette `roles`, CSS `cssVars`, `themeColor`, font hints). Fold the facts into the merge (step 5) under the **same source**, tagged "(rendered)" (e.g. `Official website (rendered)`); pass the branding to step 8 tier 1. A `--follow-posts` mode additionally harvests post images from an Instagram/Facebook profile via each post's public `og:image` (no login) — see step 7's media notes. If the helper prints `{"ok":false,…}` or exits non-zero, record that source as `blocked`/`error` and move on — never abort the run.

### 5. Merge with provenance

Combine the per-source results into one record. Rules:

- **Keep every distinct value**, each tagged with the source(s) that reported it. Never silently pick a single winner.
- **Ratings:** always list **per source** (score/scale/count).
- **Identity fields** (name, status, address, coordinates, types): choose one **canonical** value by authority — Google over directories over aggregators — and list the rest as alternates.
- **Provided Google-Maps record:** when step 1 ingested a record, fold its pre-filled `Google Maps (record)` source in as the **Google** authority — it gives the canonical identity/status and is the Google entry for ratings/photos/socials. List it in the **Sources queried** appendix as `ok`, and treat its `scrapedAt` as a staleness signal when it disagrees with fresher live sources.
- **Official website authority:** the business's own site is the **top** authority for **self-reported facts** — opening hours, services/menu, itemized prices, contact details, social links, and its own logo/photos — outranking directories and aggregators. For **operational status** (permanently/temporarily closed) keep the **Google** canonical, since a site can be stale; for **ratings**, defer to the review platforms (an official site won't carry impartial ratings).
- **Rendered official site:** if the render assist (step 4b) re-extracted the official site, fold its facts in under that same top authority, tagged `Official website (rendered)`.
- **Reviews / photos:** pool across sources and **deduplicate** (same text/author, same image URL); for reviews, keep only the most positive (highest-rated) and drop critical/negative ones, since the dossier feeds a marketing site.
- **Logo:** pick one canonical `logo_url` (prefer the official website or Google, else the highest-resolution candidate) — this is the one step 7 downloads; keep other candidates as alternates. If no candidate was found but a Facebook page is known, leave it unset — step 7 will derive a genuine logo from the Facebook Graph picture endpoint.
- **Website / social links:** choose the canonical website by authority (official over directories); union social links by network, keeping distinct URLs tagged by source.
- Track each source's `access_status` for the appendix. The step-4 Workflow now returns `{ perSource, branding }`; `perSource` has one object per source in the original order, and a source whose agent died comes back as `access_status: "error"` (never dropped), so every selected source appears in the appendix. Normalize `status` tokens to spaced form (`temporarily_closed` → "temporarily closed") when rendering.
- **Branding:** set the `branding` object (the website agent's result, or `null` when the shop had no known site) aside — it is **not** merged into the per-source record; it feeds the **Derive the branding theme** step (step 8).

### 6. Resolve the output folder

Fix the destination directory `<dir>` **before** writing anything, so assets and dossier land together:

- Default `<dir>` = `data/<slug>`.
- If `data/<slug>/` already exists, read its existing dossier first: if it's the **same** business (matching name / address), reuse `<dir>` and **overwrite** it — delete the old `<dir>/assets/` first so stale photos from the previous run don't linger; if a genuinely **different** business that happens to share the slug, set `<dir>` = `data/<slug>-2` (then `-3`, … if that also exists).

### 7. Download media

After the folder is fixed, in the **main agent** (not the source agents), download into `<dir>/assets/`:

- The chosen **logo** → `assets/logo.<ext>`.
  - **No logo resolved, or its download failed?** If a **Facebook page** is known (`social_links.facebook`), fetch its profile picture from the keyless Graph endpoint and keep it as a **genuine** logo _before_ falling back to a generated one (step 9): `https://graph.facebook.com/<vanity-or-id>/picture?width=1024&height=1024`. It 302-redirects to the fbcdn image, so keep `curl -L` (the recipe below already includes it) and take the extension from the response content-type (usually `jpg`). Derive `<vanity-or-id>` from the Facebook URL path (`facebook.com/MyShopGeneva` → `MyShopGeneva`); the **numeric** page id is the most reliable form, so use it when captured and resolve it (e.g. from the page source) if a vanity fetch comes back empty. Keep the `width`/`height` params — `?type=large` caps at 200px. Attribute it as source **"Facebook (Graph picture)"** with the Graph URL. Being the real uploaded profile image, it counts as a genuine logo: it feeds logo-derived branding (step 8) and suppresses the step-9 placeholder. If it returns the generic silhouette, an empty body, or a block, discard it and try the Instagram fallback below.
  - **Still no logo, and an Instagram account is known?** Best-effort only: fetch the profile (`https://www.instagram.com/<handle>/`) and, if the login wall hasn't stripped the markup, read `og:image` for the avatar CDN URL and download it as the logo, attributed **"Instagram (og:image)"**. There is no keyless Graph equivalent and this is flaky and degrading, so treat a miss as normal and fall through to step 9.
- Up to **20 deduplicated photos** → `assets/photo-001.<ext>`, `photo-002.<ext>`, … (extension from the content-type or URL). Dedup is by image URL, so the same photo served as resized CDN variants can slip through — don't treat the 20 as guaranteed-distinct.
  - **Few or no photos from the fan-out?** A keyless supplemental pass (main agent; this yields genuine imagery of the real place, so they are photos, **not** `stock-*` fallback): a **Google Images** search for the business name + "Genève" often surfaces directly-downloadable `googleusercontent`/`fbcdn`/`cdninstagram` URLs even when the origin page is walled — `googleusercontent` links are stable, while `fbcdn`/Instagram ones are signature-stamped and may 403 once expired. Confirm each image actually shows THIS business before keeping it, and attribute it to where it was found.
  - **Facebook photos are partially recoverable, no login.** Run `node .agents/skills/extract-data/scripts/render.mjs <page-or-/photos-url> --follow-posts`: it follows each `fbid=` photo permalink and scans the page markup for the embedded `scontent…fbcdn.net` image URL (FB leaves `og:image` empty behind its logged-out wall, but the photo URL is still in the page) — returned in each post's `images[]`. Use the Facebook Graph profile picture for the **logo**. Caveats: it's behind a wall so it's **fragile** (FB can close the leak), the page also embeds the cover + adjacent thumbnails so candidates need confirming (does it show THIS business?), and URLs are signed/expiring. Aggregators (Restaurant Guru) and Google stay good fallbacks.
  - **Instagram post photos ARE recoverable, no login.** When an Instagram account is known and photos are thin, run `node .agents/skills/extract-data/scripts/render.mjs <profile-url> --follow-posts` (the step-4b helper). It reads each post's public `og:image` and returns a `posts[]` array — the first page (~12 most-recent) of **genuine venue images** (attribute to Instagram). Download them with step 7's `curl` recipe. Caveats: carousels give the cover image only, reels give the thumbnail frame, the og:image URLs are time-signed and **expire** (download promptly), and older posts beyond the first page need auth (out of scope). The profile **avatar** is still available via the profile's own `og:image`.

Use `curl` via Bash with a normal browser User-Agent and a Referer matching the source page (plain browser headers — not rotation or bypass) plus a timeout, since many image CDNs reject header-less requests:

`curl -fsSL --max-time 30 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36" -e "<source-page-url>" -o <path> "<url>"`

On any failure (404, block, timeout): keep the source URL in the markdown, record the failure in the appendix, and continue — never abort the run. Note the 20-photo cap and any skipped photos in the appendix.

After downloading, drop byte-for-byte duplicates that URL-dedup missed (the same image served at different CDN URLs): compare file hashes (e.g. `sha256sum <dir>/assets/photo-* | sort`), delete the redundant copies, and renumber so `photo-001…` stays contiguous.

### 8. Derive the branding theme

In the **main agent**, synthesize one canonical visual **theme** for the business, keeping the evidence as alternates. Work the tiers in priority order and fix the _canonical_ value at the first that yields real signal — but keep lower tiers as cross-checks/alternates:

1. **Website (highest authority)** — if the step-4 branding agent **or the render assist (step 4b)** returned usable data, canonicalize from it: palette roles, fonts, `theme-color`, shape/depth/spacing, vibe. Prefer the render assist's **computed-style** values when present (its `roles`/`cssVars`/`themeColor` reflect what the browser actually paints, so they beat static-CSS parsing on JS-rendered sites). Basis = **extracted**.
2. **Logo-derived** — else (or as a cross-check), inspect the downloaded `<dir>/assets/logo.*` **with your own vision** (read the image file) and name its dominant colors; assign them to primary/accent/background/text. `convert`/ImageMagick may refine this with a colour histogram if available, but vision alone suffices. For type, describe the lettering and nominate a Google-Fonts match only if it's a clear wordmark. Basis = **logo-derived**.
3. **Name/type archetype (last resort)** — else infer a **category-fitting, cliché-averse** palette and type mood from the name + type(s) (e.g. a taqueria → warm terracotta + deep green + cream, friendly rounded display; a fine French restaurant → muted, restrained, elegant). Avoid literal national-flag / stereotype kitsch. Basis = **inferred** (low confidence — a replaceable placeholder).

Assemble the canonical theme from the chosen tier:

- **Palette:** semantic roles `primary`, `accent`, `background`, `surface`, `text`, `muted`, `border`, each a `#rrggbb` tagged with its source/basis; keep distinct alternates (e.g. logo colours when the website was canonical).
- **Typography:** a `display` + `body` pairing. Nominate **Google-Fonts-available** families (that is what the build can load) and record the actually-observed font as provenance/alt; when unsure, give a descriptor instead (e.g. "geometric sans, 700–800 display").
- **theme-color:** one `#rrggbb` (usually the primary or background).
- **Shape / Depth / Spacing:** radius, shadow/elevation, and density character — but **label these "extracted" only when a site supplied them**; on the logo/name tiers they are tasteful defaults, so mark them **convention, not evidence**.
- **Vibe:** 3–5 adjectives.

Tag every value with its source/basis and an overall **confidence** (high / medium / low). When a real website theme exists, do **not** also run the name/type archetype — it only adds noise.

### 9. Fallback imagery when none found

The dossier is the build's **single asset source**, so when genuine media is missing, produce **clearly-labeled fallback assets** here rather than leaving the build empty-handed. Fallback assets are **decorative stand-ins, never represented as the real business**; keep them in a separate lane — distinct filenames plus explicit dossier labels — so the build and any reader can tell them from official media. This is the **only** place non-sourced media enters the pipeline; facts, copy, hours, prices, and reviews stay strictly sourced — never fabricate those.

- **No genuine logo** (none downloaded in step 7) → generate a simple placeholder `assets/logo.svg`: a monogram or wordmark of the business name set in the **derived palette** (step 8). Hand-author the SVG; `convert`/ImageMagick or `inkscape` (whichever is present) can rasterize a PNG if needed. It is a generated placeholder **derived from the palette, not branding evidence** — it does **not** raise the branding **Basis**. Label it as generated in the Media section.
- **Zero genuine photos** (none downloaded in step 7) → download ~3-6 **free-license** images thematically related to the business **type** (Unsplash, Pexels, Openverse, or Wikimedia Commons; same `curl` recipe as step 7) to `assets/stock-001.<ext>`, `stock-002.<ext>`, …. They illustrate the category, **not this specific venue**. For **each**, record the source URL, **license, and required attribution**. Use a clearly free-for-reuse license only; skip anything without one.

Trigger only on a genuine absence (no logo, or no photos at all) — if real media exists, add no fallback. Record in the appendix what fallback was produced and why.

### 9b. Propose available .ch domains (when no working website)

When the business has **no working own official website** — step 1b found none or you marked the candidate **broken**, and no own-site surfaced in the merge — propose **3 available `.ch` domains** for the new site. Skip this step entirely when a working own-site exists.

**Build candidates from the business name only** (not the locality):

- ASCII-fold, lowercase, drop punctuation and spaces. **`.ch` only**; **never add a locality token, and strip any `geneve`/`geneva` already in the name** — e.g. `ultrabeautygeneve` → `ultrabeauty.ch`.
- Generate natural variants: the full name, the spaceless name, a hyphenated form, the name + **a word that fits the business's own type(s)** from `resources/businesses.txt` (e.g. `-coiffure`/`-salon` for `hair_salon`/`barber_shop`, `-cafe` for `coffee_shop`, `-resto` for `restaurant`, `-boulangerie` for `bakery`, `-fleurs` for `florist`), or a short brandable abbreviation. **Never append a type word that doesn't match the business** (e.g. no `-salon` for a café). Prefer natural Swiss-French terms (the sites are fr-CH). Keep them readable.

**Check each for availability via DNS** — the reliable keyless signal for `.ch`, verified in this environment (only confirmed-available domains count):

- **DNS status (decisive):** `dig +noall +comments <name>.ch SOA | grep -oE 'status: [A-Z]+'` — **`NXDOMAIN` = available**, **`NOERROR` = taken** (the name exists in DNS). SWITCH (the `.ch` registry) returns NXDOMAIN only for unregistered names, so this is authoritative; don't rely on `+short NS`/`SOA` having output (a registered domain can answer NOERROR with neither).
- If a query errors or times out, retry once; if still inconclusive, mark the candidate **uncertain** and don't count it toward the 3.

**Don't** use RDAP or `whois` for `.ch`: `rdap.org` returns 404 for _every_ `.ch` name (registered or not — it has no `.ch` service), and the `whois` CLI is usually not installed, so an RDAP 404 or a missing `whois` must **never** be read as "available". (If the skill is later extended past `.ch`, `curl https://rdap.org/domain/<d>` — 404 = available, 200 = taken — works for TLDs RDAP actually serves.)

**Reach 3.** Keep generating and checking until **3 confirmed-available** `.ch` domains are collected, replacing any taken/uncertain candidate with a fresh name variant. **Cap total checks at ~12**: if 3 can't be confirmed within the cap, record whatever was found (even 0–2) and flag that the cap was hit. Never loop indefinitely.

Carry the result into step 10's **Suggested domains** section, each tagged with how and when it was checked.

### 10. Write the dossier

Write `<dir>/<slug>.md` using the template below. Reference each official asset by its **local path** _and_ its **source URL**; reference each fallback asset by its local path with its generated/illustrative label (and license for `stock-*`). Fill the **Missing information** section with a simple bullet list of the standard fields no source could provide (or that are only low-confidence placeholders, e.g. an inferred theme or generated logo) so they can be completed manually; if nothing is missing, say so.

### 11. Register in the portfolio index

The dossier now backs the public **portfolio index** (`docs/index.html`) and its dossier viewer (`docs/data.html`), so register this business there. Work **idempotently, keyed by `<slug>`** (the output folder name) — re-running must not duplicate anything.

Derive two display strings (neither is the raw slug):

- **Name** — the dossier's **canonical name** (the `# <Canonical Name>` heading / Summary), verbatim. E.g. folder `gase-jean-robert_tailor` → "Jean-Robert Gase".
- **Trade** — a short, human-readable label for the **primary type** (`types[0]`): turn `_`/`-` into spaces and Title-case, matching the editorial style of the existing entries — e.g. `barber_shop` → "Barbershop", `coffee_shop` → "Coffee shop", `cafe` → "Café", `home_goods_store` → "Home goods", `second_hand_shop` → "Second-hand shop", `pet_groomer` → "Pet groomer".

Then make two edits:

1.  **`docs/data.html` — viewer allow-list (required).** The viewer only renders a slug listed in its hardcoded `SHOPS` map; an unknown slug shows "Dossier not found", so the index's Data link is dead without this. Add or update the entry (keep the file's existing formatting):

    ```js
    "<slug>": { name: "<Name>", trade: "<Trade>" },
    ```

2.  **`docs/index.html` — the table row (upsert).** Each business is one `<tr>` with a **Website** cell and a **Data** cell, each a button or a `—` placeholder. Find the row whose `<slug>` appears in its Data href (`data.html?slug=<slug>`) or Website href (`webs/<slug>`):
    - **Row exists** → set its **Data** cell to the button (turning a `—` into a link if needed) and refresh the name/trade; **leave the Website cell untouched** — it belongs to `make-website`.
    - **No row** → append one matching the existing markup. Its **Website** cell is the live button when `docs/webs/<slug>/` already exists, else the placeholder:

           ```html
           <tr>
               <td class="c-name"><span class="name"><Name></span><span class="trade"><Trade></span></td>
               <td class="c-act"><a class="btn btn-site" href="webs/<slug>" target="_blank" rel="noopener">Website</a></td>
               <td class="c-act"><a class="btn btn-data" href="data.html?slug=<slug>" target="_blank" rel="noopener">Data</a></td>
           </tr>
           ```

           Website placeholder when no site exists yet: `<td class="c-act"><span class="na" title="No website built">—</span></td>`.

      Match on the **data slug** only. A legacy row whose website slug differs from the data slug (e.g. `webs/miro_barbershop` vs the dossier `miro-barber-shop_barber-shop`) won't match, so a fresh row is added — note it in the final summary for the human to reconcile rather than guessing a fuzzy name match.

### 12. Verify before finishing

A quick self-check — don't report success without it:

- The dossier `<dir>/<slug>.md` exists and is non-empty.
- Every `assets/…` path referenced in the markdown exists on disk, and every file in `<dir>/assets/` is referenced back (no danglers either way).
- The media count matches the **Media** section and the appendix: real `photo-*`/`logo` downloaded, plus any **generated logo** / `stock-*` fallback.
- **Fallback imagery** (if any) sits in its own lane — a generated logo and `stock-*` are labeled as generated/illustrative (with license + attribution for `stock-*`) and stay distinguishable from official `logo`/`photo-*`. It was added only because genuine media was absent; facts/copy/hours/prices/reviews remain strictly sourced.
- The **Sources queried** table lists _every_ selected source (`ok`/`partial`/`blocked`/`not_found`/`no_data`/`error`), including the `Official website` row when the shop has a site.
- **Sanity-check the fan-out:** if _every_ source came back `blocked`/`no_data`/`error`, suspect the sub-agents lacked web access (no `WebSearch`/`WebFetch`) rather than a genuine data desert — flag it instead of writing a hollow dossier.
- The **Branding / Theme** section exists with a labeled **Basis**, valid `#rrggbb` palette values, and named `display`/`body` fonts. If a usable website was found, the basis should be **extracted** — an **inferred** basis despite a known site means both the branding agent and the render assist (step 4b) failed; flag it.
- The **Missing information** section lists the standard fields that came back empty or low-confidence (e.g. website, opening hours, ratings, reviews, email, social links, genuine logo, extracted branding) so a human knows what to chase — or states that none are missing.
- When the business has **no working website**, a **Suggested domains** section lists up to 3 available `.ch` candidates (each confirmed available via a DNS NXDOMAIN check) — or, if 3 couldn't be confirmed within the cap, the ones found plus a note. It is **absent** when a working own-site exists.
- The business is **registered in the portfolio index**: `docs/data.html`'s `SHOPS` map has the `<slug>` entry, and `docs/index.html` has **exactly one** row for it with a working **Data** link (`data.html?slug=<slug>`) — no duplicate row.

## Output template

```markdown
# <Canonical Name>

> Generated by `extract-data` on <YYYY-MM-DD>. Values are annotated with their source(s);
> conflicting values are all kept (canonical first, alternates noted).

## Summary

- **Status:** <operational | temporarily closed | permanently closed | unknown> _(sources)_
- **Type(s):** <type, type> _(sources)_
- **Canonical name:** <name> _(sources)_

## Identity

- **Name:** <canonical> _(sources)_ — alt: "<other>" _(source)_

## Contact

- **Address:** <value> _(sources)_ — alt: <other> _(source)_
- **Coordinates:** <lat>, <lng> _(source)_
- **Phone(s):** <p1> _(sources)_, <p2> _(source)_
- **Email(s):** <e1> _(sources)_
- **Website:** <url> _(sources)_
- **Social links:** Instagram <url> _(source)_, Facebook <url> _(source)_

## Opening hours

- Per source (note disagreements):
  - **<Source>:** Mon–Fri 9–18, Sat 9–17, Sun closed

## Ratings

| Source      | Score   | Count |
| ----------- | ------- | ----- |
| Google      | 4.6 / 5 | 212   |
| TripAdvisor | 4.0 / 5 | 38    |

## Reviews

**<Source>**

- <author>, <date>, <rating>: "<excerpt>" — <url>

## Services / Products / Menu

- **<name>** — <description> — <price> _(source)_

## Branding / Theme

**Basis:** <extracted from website | logo-derived | inferred from name/type> _(confidence)_

**Palette** (canonical; alternates noted)

| Role       | Hex       | Source / basis             |
| ---------- | --------- | -------------------------- |
| primary    | `#1b4d3e` | site `--brand` _(website)_ |
| accent     | `#e0a458` | button bg _(website)_      |
| background | `#faf7f2` | body _(website)_           |
| surface    | `#ffffff` | cards _(website)_          |
| text       | `#1a1a1a` | body color _(website)_     |
| muted      | `#6b6b6b` | _(website)_                |
| border     | `#e6e0d8` | _(website)_                |

- Alt: logo-derived `#14443a`, `#d99a4e` _(logo)_

**Typography**

- **Display:** "Fraunces" _(Google Fonts; observed on site: "Fraunces")_
- **Body:** "Inter" _(Google Fonts; observed on site: "Inter")_

**theme-color:** `#1b4d3e`

**Shape / Depth / Spacing**

- Radius: 8px _(website)_ · Borders: hairline 1px _(website)_
- Depth: soft diffuse shadow _(website)_
- Spacing: airy / generous _(website)_

_(On the logo/name tiers, shape/depth/spacing are tasteful defaults — mark them "convention, not evidence".)_

**Vibe:** warm, artisanal, understated

## Media

### Logo

- `assets/logo.<ext>` — source: <source> — <original url>
- _(generated fallback, if no real logo:)_ `assets/logo.svg` — **generated placeholder**, not an official logo (basis: name/type; palette `#…`)

### Photos

- `assets/photo-001.<ext>` — source: <source> — <original url>
- `assets/photo-002.<ext>` — source: <source> — <original url>

### Illustrative / fallback imagery

_(only when no genuine logo/photos were found — decorative stand-ins, **not** the actual business)_

- `assets/stock-001.<ext>` — **illustrative, not the actual business** — source: <source> — <url> — license: <license + required attribution>

## Sources queried

| Source                  | Access    | Notes        |
| ----------------------- | --------- | ------------ |
| Google Business Profile | ok        |              |
| local.ch                | ok        |              |
| TripAdvisor             | blocked   | HTTP 403     |
| Yelp                    | not_found |              |
| Infobel                 | error     | agent failed |

## Notes

- Photo cap: 20 (<N> downloaded, <M> skipped, <D> duplicates removed).
- Download failures: <list or none>.
- Fallback imagery: <none | generated `logo.svg`; <N> `stock-*` sourced (free-license) because no genuine logo/photos were found>.
- Other relevant info: <anything captured outside the standard fields>.

## Suggested domains

_(Only when the business has no working website — candidate `.ch` names for the new site, built from the business name and confirmed available at check time. Availability is point-in-time; re-verify before registering.)_

- `<name>.ch` — **available** (DNS: NXDOMAIN, <YYYY-MM-DD>)
- `<name>-<type-word>.ch` — **available** (DNS: NXDOMAIN, <YYYY-MM-DD>)
- `<altname>.ch` — **available** (DNS: NXDOMAIN, <YYYY-MM-DD>)

_(If fewer than 3 could be confirmed within the check cap, list those found and say so.)_

## Missing information

_Standard fields no source could fill, or that are only low-confidence placeholders — a human may be able to supply these manually. When **Website** is among them, the **Suggested domains** section above lists available `.ch` candidates for the new build. If every standard field was found, write "- None — all standard fields were found."_

- **<Field>:** <none found on any source | placeholder/inferred — needs a real value>
- ...
```

## Constraints & conventions

- **Web only, no credentialed APIs.** Never assume, invent, or use credentials; no paid APIs. Free keyless public endpoints (Overpass, Nominatim) are allowed and preferred over HTML scraping. Best-effort fetch; no anti-bot bypass.
- **No-login render assist (headless browser).** A committed Playwright helper (`scripts/render.mjs`) may render a **public**, JS-rendered page in headless Chromium to recover facts/branding a plain fetch misses (the business's own site, JS-rendered directories). Same best-effort/public posture — **no login, no bypass** — so it does **not** reach content that truly requires a session. Its `--follow-posts` mode harvests an Instagram/Facebook profile's first-page post images — Instagram via each post's public `og:image`, Facebook by scanning the `scontent…fbcdn.net` URL embedded in the logged-out photo page (still no login; see step 7); deeper/private content needs auth and stays out of scope. Main-agent only (sub-agents have web tools, not a browser).
- **Original language preserved** — translation is the website-build step's job.
- **Provenance everywhere** — every value carries its source(s); a primary-source fact must be distinguishable from an aggregator's guess.
- **Partial results are expected** — most shops won't have all fields, and some sources will be blocked or empty. Record field-level gaps in the **Missing information** section and source-access gaps in the appendix table; never fail the run over a missing field or source.
- **Fallback imagery is media-only, labeled, and free-license.** When no genuine logo/photos exist, generated/stock stand-ins may be added (step 9) — always free-license, attributed, kept in a separate lane (a generated `logo.svg`, `stock-*`), and never passed off as the real business. This never extends to facts: hours, prices, services, reviews, and copy stay strictly sourced.
- **One business per invocation.**
