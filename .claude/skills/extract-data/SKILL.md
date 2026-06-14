---
name: extract-data
description: >-
  Enrich a single Geneva business by gathering publicly-available data in parallel from many web
  sources, then write a structured markdown dossier (with downloaded logo/photos) to data/<slug>/.
  Use when the user wants to collect, enhance, or research all available information about a specific
  shop/business — name, address, hours, ratings, reviews, services/menu, prices, photos, social
  links, etc. This is step 2 (“enhance”) of the websites pipeline: extract → enhance → build.
---

# extract-data

Gather everything publicly available about **one** Geneva business and write it to a structured markdown dossier under `data/<slug>/`, with the logo and photos downloaded into an `assets/`
subfolder. The dossier feeds the downstream website build (which uses `references/site-structure.md`
and `references/best-practices.md`).

**Scope:** this skill ends when the dossier is written. It does **not** build the website.
**One business per invocation** — the caller iterates over a business list.

## Inputs

Accept the shop info from the skill arguments or by asking the user. Parse whatever free-form
details are given (name, address, website, phone, etc.).

**Required to proceed:** business **name**, that it is in **Geneva, Switzerland**, and its
**type(s)** (from the `resources/businesses.txt` taxonomy, e.g. `Barber Shop`, `Restaurant`). Ask
the user **only** for whichever of these is missing — don't interrogate field-by-field.

Everything else is optional and just improves matching.

## Procedure

### 1. Collect & confirm identity

Assemble a shop record:

```
{ name, types: [...], address?, website?, phones?, emails?, notes? }
```

If name, Geneva, or type(s) are missing, ask once for the missing piece. Do not ask for anything
else. Build the output **slug** = kebab-case of the name (e.g. `Miro Barbershop` → `miro-barbershop`).

### 2. Read the source reference

Read `references/data-extraction.md` in full. It catalogs every source, its Geneva coverage, the
fields it exposes, and its access method/ToS notes.

### 3. Build the source list

Select the sources to query for **this** shop:

- **All Generic sites** with plausible Geneva coverage for this business (skip ones whose coverage
  note says this type won't appear).
- **All category-specific sites** for the shop's type(s). Map type → category using
  `resources/businesses.txt` (its category headers match the `## <Category>` sections in
  `data-extraction.md`); if the shop has multiple types spanning categories, include all matching
  category sections.

Then prune:

- **Drop** any entry the doc marks defunct, "do not use", "none"/no-CH-coverage, or "not a usable
  source".
- **Drop redundant aggregators** when a primary source they re-publish is already in the list (the
  doc flags these, e.g. yellowpages.swiss, companyfinder.ch, Restaurant Guru, infoisinfo).
- **Drop sources the doc flags as actively bot-blocking / 403** (phrases like "actively blocks bots
  (HTTP 403)", "returns 403 to bots", "returned HTTP 403 to automated fetch"). A best-effort fetch
  will almost certainly fail on these, so they don't earn an agent — e.g. Cylex, resto-rang.ch,
  Comparis Garagensuche, pressingsuisse.com, laveriesuisse.com, Raisin, Boucherie Suisse, TasteAtlas.

The result is typically ~15–30 sources. For each, keep: `{ name, url, access_notes }` (url = the
source's site or its Geneva page if the doc gives one; access_notes = the doc's access/ToS line).

Do **not** pause for confirmation — proceed straight to the fan-out.

### 4. Fan out — one agent per source (Workflow tool)

Call the **Workflow** tool with the script below, passing `args = { shop, sources }`. Each source
gets one independent, schema-validated agent. (Invoking Workflow here is expected — this skill
instructs it.)

```javascript
export const meta = {
  name: "extract-data-gather",
  description:
    "Fan out one web-research agent per source to gather data about one Geneva shop",
  phases: [{ title: "Gather", detail: "one agent per source" }],
};

const { shop, sources } = args;

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
      enum: ["ok", "partial", "blocked", "not_found", "no_data"],
      description:
        "ok=found+extracted, partial=some data, blocked=bot-blocked/403, not_found=business not listed, no_data=listed but empty",
    },
    status: {
      type: ["string", "null"],
      description:
        "operational / temporarily_closed / permanently_closed / unknown",
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

phase("Gather");

const results = await parallel(
  sources.map(
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
          "- Web only: use web search + public page fetches. Assume NO API keys. Do not invent or use credentials.",
          "- Pragmatic best-effort: if the page loads, extract it; do NOT attempt anti-bot bypass (proxies, UA rotation).",
          "- If the source blocks you, the business is not listed, or the page is empty, report it via access_status and stop — don't guess.",
          "- Match carefully: confirm name + Geneva (+ address/website if known) so you extract the RIGHT business.",
          "- Preserve original language; do NOT translate names, services, or menu text.",
          "- Logo/photos: return image URLs only. Do NOT download anything.",
          "- Reviews: at most ~5-10 representative ones.",
          "- Do NOT merge in knowledge from other sources or your own memory; only this source.",
        ].join("\n"),
        { label: `src:${s.name}`, phase: "Gather", schema: SCHEMA },
      ),
  ),
);

return results.filter(Boolean);
```

### 5. Merge with provenance

Combine the per-source results into one record. Rules:

- **Keep every distinct value**, each tagged with the source(s) that reported it. Never silently
  pick a single winner.
- **Ratings:** always list **per source** (score/scale/count).
- **Identity fields** (name, status, address, coordinates, types): choose one **canonical** value
  by authority — official registry (Zefix/UID/RC Genève) or Google over directories over
  aggregators — and list the rest as alternates.
- **Reviews / photos:** pool across sources and **deduplicate** (same text/author, same image URL).
- **Identifiers:** collect all (google_place_id, uid_che, …).
- Track each source's `access_status` for the appendix.

### 6. Download media

After merge, in the **main agent** (not the source agents), download into `data/<slug>/assets/`:

- The chosen **logo** → `assets/logo.<ext>`.
- Up to **20 deduplicated photos** → `assets/photo-001.<ext>`, `photo-002.<ext>`, … (extension from
  the content-type or URL).

Use `curl` via Bash with a normal browser User-Agent and a Referer matching the source page (plain
browser headers — not rotation or bypass) plus a timeout, since many image CDNs reject header-less
requests:

`curl -fsSL --max-time 30 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36" -e "<source-page-url>" -o <path> "<url>"`

On any failure (404, block, timeout): keep the source URL in the markdown, record the failure in the
appendix, and continue — never abort the run. Note the 20-photo cap and any skipped photos in the
appendix.

### 7. Write the dossier

Write `data/<slug>/<slug>.md` using the template below. If `data/<slug>/` already exists, read its
dossier first: if it's the **same** business (matching name / address / identifiers), **overwrite**
the folder; if a genuinely **different** business that happens to share the slug, write to
`data/<slug>-2/` instead. Reference each downloaded asset by its **local path** _and_ its
**source URL**.

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
- **Identifiers:** Google place*id `<...>`; UID `<CHE-...>` *(sources)\_

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

## Media

### Logo

- `assets/logo.<ext>` — source: <source> — <original url>

### Photos

- `assets/photo-001.<ext>` — source: <source> — <original url>
- `assets/photo-002.<ext>` — source: <source> — <original url>

## Sources queried

| Source                  | Access    | Notes    |
| ----------------------- | --------- | -------- |
| Google Business Profile | ok        |          |
| local.ch                | ok        |          |
| Cylex Schweiz           | blocked   | HTTP 403 |
| Yelp                    | not_found |          |

## Notes

- Photo cap: 20 (<N> downloaded, <M> skipped).
- Download failures: <list or none>.
- Other relevant info: <anything captured outside the standard fields>.
```

## Constraints & conventions

- **Web only, no API keys.** Never assume or use credentials. Best-effort fetch; no anti-bot bypass.
- **Original language preserved** — translation is the website-build step's job.
- **Provenance everywhere** — every value carries its source(s); a registry fact must be
  distinguishable from an aggregator's guess.
- **Partial results are expected** — most shops won't have all fields, and some sources will be
  blocked or empty. Record gaps in the appendix; never fail the run over a missing field or source.
- **One business per invocation.**
