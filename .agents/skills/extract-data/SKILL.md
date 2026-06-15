---
name: extract-data
description: >-
  Enrich a single Geneva business by gathering publicly-available data in parallel from many web sources, then write a structured markdown dossier (with downloaded logo/photos) to data/<slug>/. Use when the user wants to collect, enhance, or research all available information about a specific shop/business — name, address, hours, ratings, reviews, services/menu, prices, photos, social links, branding (colors/fonts), etc. This is step 2 (“enhance”) of the websites pipeline: extract → enhance → build.
---

# extract-data

Gather everything publicly available about **one** Geneva business and write it to a structured markdown dossier under `data/<slug>/`, with the logo and photos downloaded into an `assets/` subfolder. The dossier feeds the downstream website build (which uses `references/site-structure.md` and `references/best-practices.md`).

**Scope:** this skill ends when the dossier is written. It does **not** build the website. **One business per invocation** — the caller iterates over a business list. **Paths** are relative to the repo root (the working directory), not this skill folder: `references/` and `resources/` live at the repo root and are shared with `make-website`.

## Inputs

Accept the shop info from the skill arguments or by asking the user. Parse whatever free-form details are given (name, address, website, phone, etc.).

**Google Maps URL shortcut.** The user may instead (or also) paste a **Google Maps link** — a full `…google.com/maps/place/…` URL or a short `maps.app.goo.gl/…` / `goo.gl/maps/…` link. Treat it as the identity seed: step 1 resolves it, parses name/coordinates/place-id from the URL, and best-effort extracts the listing (address, phone, website, hours, category), so the user usually needn't type those.

**Required to proceed:** business **name**, that it is in **Geneva, Switzerland**, and its **type(s)** (from the `resources/businesses.txt` taxonomy, e.g. `Barber Shop`, `Restaurant`). Ask the user **only** for whichever of these is missing — don't interrogate field-by-field. A Google Maps URL usually supplies the **name** and confirms **Geneva** (via coordinates), so often only the **type(s)** needs inferring/confirming.

Everything else is optional and just improves matching.

## Procedure

### 1. Collect & confirm identity

**If the input is (or contains) a Google Maps URL, resolve and extract it first:**

1. **Resolve short links.** For `maps.app.goo.gl/…` or `goo.gl/maps/…`, follow redirects to the canonical place URL — e.g. `curl -sIL -o /dev/null -w '%{url_effective}' "<short-url>"` (or WebFetch, which follows redirects).
2. **Parse the URL string** (reliable, no page render needed):
   - **Name** — the `/place/<Name>/` segment (URL-decode; `+` → space).
   - **Coordinates** — `@<lat>,<lng>,…` or the `!3d<lat>!4d<lng>` data params.
   - **Place identifier** — the `0x…:0x…` hex (CID), `!1s0x…` (ftid), and/or `…%2Fg%2F…` (Knowledge-Graph mid) → store under `identifiers` as `google_cid` / `google_maps_ftid` / `google_kg_mid`, plus the canonical `google_maps_url`.
   - **Validate** the coordinates fall in the Geneva area (≈ lat 46.1–46.3, lng 6.0–6.3); if not, flag it — the pipeline is Geneva-only.
3. **Extract the listing (best-effort).** Fetch the resolved place page for **address, phone, website, opening hours, category, rating**. Google Maps is JS-rendered and bot-protected, so if the fetch is blocked or thin, fall back to a **web search** for the place (parsed name + "Geneva" + street) and read the Google knowledge-panel details. Capture whatever is available, tagged source **"Google Maps (URL)"**. Do **not** fail if blocked — the fan-out's Google source agent (step 4) re-extracts and corroborates, so this is a head-start, not a single point of failure.
4. **Map the category → taxonomy type.** Translate the Google category (e.g. "Barber shop", "Coffee shop") to the `resources/businesses.txt` type(s); propose it and let the user confirm. If no category was obtained, ask the user for the type(s) only.

Assemble a shop record (seeding it with everything the Maps URL provided, if any):

```
{ name, types: [...], address?, website?, phones?, emails?, notes? }
```

If name, Geneva, or type(s) are missing, ask once for the missing piece. Do not ask for anything else. Build the output **slug** = `<name>_<type>` — the business name and its **primary type** (`types[0]`), each kebab-cased with accents ASCII-folded and punctuation dropped, joined by a single underscore (the only `_` in the slug, so name and type stay separable). E.g. `Café Crémerie` (Coffee Shop) → `cafe-cremerie_coffee-shop`; `Le Chat Noir` (Bar / Pub) → `le-chat-noir_bar-pub`.

**Pin the identity before fanning out.** If neither address nor website is known, first do a quick resolution pass — search Google Business Profile / Maps and local.ch for the name + "Geneva" + type — to lock the canonical address (and website, if found), then add it to the shop record so every source agent matches against the same business. If it can't be resolved confidently, proceed anyway but treat matching as lower-confidence and flag ambiguous results in the merge. The canonical **website**, if found, is also the primary source for the **branding theme** (step 8), so resolving it pays off twice.

### 2. Read the source reference

Read `references/data-extraction.md` in full. It catalogs every source, its Geneva coverage, the fields it exposes, and its access method/ToS notes.

### 3. Build the source list

Select the sources to query for **this** shop:

- **The shop's own official website** (when `shop.website` is known) — add it as the **first** source, named `Official website`, queried with the full per-source schema. It is the **top-authority** source for self-reported facts (hours, services, menu, prices, contact, social, logo/photos) and is **not** in `data-extraction.md`. Set its `access_notes` to flag its nature, e.g. _"The business's OWN site — most authoritative for self-reported hours/services/menu/prices/contact; extract comprehensively."_ A separate `branding:website` agent reads the same site for the visual theme (step 8), so this agent focuses on facts/content.
- **All Generic sites** with plausible Geneva coverage for this business (skip ones whose coverage note says this type won't appear).
- **All category-specific sites** for the shop's type(s). Map type → category using `resources/businesses.txt` (its category headers match the `## <Category>` sections in `data-extraction.md`); if the shop has multiple types spanning categories, include all matching category sections.

Then prune:

- **Drop** any entry the doc marks defunct, "do not use", "none"/no-CH-coverage, or "not a usable source".
- **Drop redundant aggregators** when a primary source they re-publish is already in the list (the doc flags these, e.g. yellowpages.swiss, companyfinder.ch, Restaurant Guru, infoisinfo).
- **Drop sources the doc flags as actively bot-blocking / 403** (phrases like "actively blocks bots (HTTP 403)", "returns 403 to bots", "returned HTTP 403 to automated fetch"). A best-effort fetch will almost certainly fail on these, so they don't earn an agent (e.g. Cylex). Scan the doc for these phrases rather than a fixed name list, which goes stale as the reference changes.

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
      description: "Up to ~5-10 representative reviews",
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
    prices: {
      type: ["string", "null"],
      description: "Overall price level and/or notable prices",
    },
    logo_url: { type: ["string", "null"] },
    photo_urls: { type: "array", items: { type: "string" } },
    social_links: {
      type: ["object", "null"],
      description:
        "Map of network -> URL (facebook, instagram, x, tiktok, linkedin, youtube, ...)",
      additionalProperties: { type: "string" },
    },
    identifiers: {
      type: ["object", "null"],
      description:
        "Stable IDs this source exposes, e.g. google_place_id, uid_che",
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
        "- Web only: use web search + public page fetches. Do NOT use paid or credentialed APIs and never invent or use credentials — but where THIS source exposes a free keyless endpoint (e.g. Overpass/Nominatim for OpenStreetMap at <=1 req/s, the Zefix public REST search, the Wikidata/Wikipedia APIs, opendata.swiss/CKAN), prefer it over scraping the source's HTML. Don't substitute a different source's API for the one you're assigned.",
        "- Pragmatic best-effort: if the page loads, extract it; do NOT attempt anti-bot bypass (proxies, UA rotation).",
        "- If the source blocks you, the business is not listed, or the page is empty, report it via access_status and stop — don't guess.",
        "- Match carefully: confirm name + Geneva (+ address/website if known) so you extract the RIGHT business.",
        "- Preserve original language; do NOT translate names, services, or menu text.",
        "- Logo/photos: return absolute image URLs only (resolve relative paths against the page URL); do NOT download anything. Photos: up to ~15 representative ones.",
        "- Reviews: at most ~5-10 representative ones.",
        "- Also capture FAQ-useful extras when the source shows them — payment methods, parking/access, accessibility, age limits, booking/deposit policy, founding year — in `notes`.",
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

### 5. Merge with provenance

Combine the per-source results into one record. Rules:

- **Keep every distinct value**, each tagged with the source(s) that reported it. Never silently pick a single winner.
- **Ratings:** always list **per source** (score/scale/count).
- **Identity fields** (name, status, address, coordinates, types): choose one **canonical** value by authority — official registry (Zefix/UID/RC Genève) or Google over directories over aggregators — and list the rest as alternates.
- **Official website authority:** the business's own site is the **top** authority for **self-reported facts** — opening hours, services/menu, prices, contact details, social links, and its own logo/photos — outranking directories and aggregators. For **legal identity & status** (registered name, permanently/temporarily closed) keep the **registry** (Zefix/UID) or Google canonical, since a site can be stale; for **ratings**, defer to the review platforms (an official site won't carry impartial ratings).
- **Reviews / photos:** pool across sources and **deduplicate** (same text/author, same image URL).
- **Logo:** pick one canonical `logo_url` (prefer the official website or Google, else the highest-resolution candidate) — this is the one step 7 downloads; keep other candidates as alternates.
- **Website / social links:** choose the canonical website by authority (registry/official over directories); union social links by network, keeping distinct URLs tagged by source.
- **Identifiers:** collect all (google_place_id, uid_che, …).
- Track each source's `access_status` for the appendix. The step-4 Workflow now returns `{ perSource, branding }`; `perSource` has one object per source in the original order, and a source whose agent died comes back as `access_status: "error"` (never dropped), so every selected source appears in the appendix. Normalize `status` tokens to spaced form (`temporarily_closed` → "temporarily closed") when rendering.
- **Branding:** set the `branding` object (the website agent's result, or `null` when the shop had no known site) aside — it is **not** merged into the per-source record; it feeds the **Derive the branding theme** step (step 8).

### 6. Resolve the output folder

Fix the destination directory `<dir>` **before** writing anything, so assets and dossier land together:

- Default `<dir>` = `data/<slug>`.
- If `data/<slug>/` already exists, read its existing dossier first: if it's the **same** business (matching name / address / identifiers), reuse `<dir>` and **overwrite** it — delete the old `<dir>/assets/` first so stale photos from the previous run don't linger; if a genuinely **different** business that happens to share the slug, set `<dir>` = `data/<slug>-2` (then `-3`, … if that also exists).

### 7. Download media

After the folder is fixed, in the **main agent** (not the source agents), download into `<dir>/assets/`:

- The chosen **logo** → `assets/logo.<ext>`.
- Up to **20 deduplicated photos** → `assets/photo-001.<ext>`, `photo-002.<ext>`, … (extension from the content-type or URL). Dedup is by image URL, so the same photo served as resized CDN variants can slip through — don't treat the 20 as guaranteed-distinct.

Use `curl` via Bash with a normal browser User-Agent and a Referer matching the source page (plain browser headers — not rotation or bypass) plus a timeout, since many image CDNs reject header-less requests:

`curl -fsSL --max-time 30 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36" -e "<source-page-url>" -o <path> "<url>"`

On any failure (404, block, timeout): keep the source URL in the markdown, record the failure in the appendix, and continue — never abort the run. Note the 20-photo cap and any skipped photos in the appendix.

After downloading, drop byte-for-byte duplicates that URL-dedup missed (the same image served at different CDN URLs): compare file hashes (e.g. `sha256sum <dir>/assets/photo-* | sort`), delete the redundant copies, and renumber so `photo-001…` stays contiguous.

### 8. Derive the branding theme

In the **main agent**, synthesize one canonical visual **theme** for the business, keeping the evidence as alternates. Work the tiers in priority order and fix the _canonical_ value at the first that yields real signal — but keep lower tiers as cross-checks/alternates:

1. **Website (highest authority)** — if the step-4 branding agent returned usable data, canonicalize from it: palette roles, fonts, `theme-color`, shape/depth/spacing, vibe. Basis = **extracted**.
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

### 10. Write the dossier

Write `<dir>/<slug>.md` using the template below. Reference each official asset by its **local path** _and_ its **source URL**; reference each fallback asset by its local path with its generated/illustrative label (and license for `stock-*`).

### 11. Verify before finishing

A quick self-check — don't report success without it:

- The dossier `<dir>/<slug>.md` exists and is non-empty.
- Every `assets/…` path referenced in the markdown exists on disk, and every file in `<dir>/assets/` is referenced back (no danglers either way).
- The media count matches the **Media** section and the appendix: real `photo-*`/`logo` downloaded, plus any **generated logo** / `stock-*` fallback.
- **Fallback imagery** (if any) sits in its own lane — a generated logo and `stock-*` are labeled as generated/illustrative (with license + attribution for `stock-*`) and stay distinguishable from official `logo`/`photo-*`. It was added only because genuine media was absent; facts/copy/hours/prices/reviews remain strictly sourced.
- The **Sources queried** table lists _every_ selected source (`ok`/`partial`/`blocked`/`not_found`/`no_data`/`error`), including the `Official website` row when the shop has a site.
- **Sanity-check the fan-out:** if _every_ source came back `blocked`/`no_data`/`error`, suspect the sub-agents lacked web access (no `WebSearch`/`WebFetch`) rather than a genuine data desert — flag it instead of writing a hollow dossier.
- The **Branding / Theme** section exists with a labeled **Basis**, valid `#rrggbb` palette values, and named `display`/`body` fonts. If a usable website was found, the basis should be **extracted** — an **inferred** basis despite a known site means the branding agent failed; flag it.

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
- **Identifiers:** Google `place_id` `<...>`; UID `<CHE-...>` _(sources)_

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

## Prices

<overall price level / notable prices> _(sources)_

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
| Cylex Schweiz           | blocked   | HTTP 403     |
| Yelp                    | not_found |              |
| Infobel                 | error     | agent failed |

## Notes

- Photo cap: 20 (<N> downloaded, <M> skipped, <D> duplicates removed).
- Download failures: <list or none>.
- Fallback imagery: <none | generated `logo.svg`; <N> `stock-*` sourced (free-license) because no genuine logo/photos were found>.
- Other relevant info: <anything captured outside the standard fields>.
```

## Constraints & conventions

- **Web only, no credentialed APIs.** Never assume, invent, or use credentials; no paid APIs. Free keyless public endpoints (Overpass, Nominatim, Wikidata, Zefix public search, opendata.swiss) are allowed and preferred over HTML scraping. Best-effort fetch; no anti-bot bypass.
- **Original language preserved** — translation is the website-build step's job.
- **Provenance everywhere** — every value carries its source(s); a registry fact must be distinguishable from an aggregator's guess.
- **Partial results are expected** — most shops won't have all fields, and some sources will be blocked or empty. Record gaps in the appendix; never fail the run over a missing field or source.
- **Fallback imagery is media-only, labeled, and free-license.** When no genuine logo/photos exist, generated/stock stand-ins may be added (step 9) — always free-license, attributed, kept in a separate lane (a generated `logo.svg`, `stock-*`), and never passed off as the real business. This never extends to facts: hours, prices, services, reviews, and copy stay strictly sourced.
- **One business per invocation.**
