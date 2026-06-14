# Web Dev Good Practices

## HTML & Document Structure

- **`<!DOCTYPE html>`** — standards mode declaration; *avoids browser quirks mode.*
- **`<html lang="en">`** — declares page language; *screen readers + translation + SEO.*
- **`<meta charset="utf-8">` first** — encoding before any text; *prevents mojibake, no re-parse.*
- **Responsive viewport meta** — `width=device-width, initial-scale=1`; *correct scaling on mobile.*
- **Semantic landmarks** — `<nav> <main> <section> <footer> <h1>`; *accessibility + SEO structure over `<div>` soup.*
- **One `<h1>` per page, ordered headings** — logical outline; *a11y + SEO.*
- **Explicit `width`/`height` on `<img>`** — reserves space; *prevents layout shift (CLS).*
- **`<link rel="canonical">`** — declares the authoritative URL; *avoids duplicate-content penalties.*
- **Clean hierarchical URLs** — e.g. `/reference/collections/list/`; *readable, SEO-friendly, organizes content.*
- **External CSS/JS files** — markup/style/behavior separated; *cacheable, maintainable.*
- **`<noscript>` fallback** — message/content shown when JS is disabled; *core info stays reachable.*

## Accessibility (a11y)

- **`alt` text describing the image** — e.g. "hex board with colored territories"; *screen readers + fallback when image fails.*
- **`aria-label` on icon-only buttons** — names the hamburger toggler; *operable without a visible label.*
- **`:focus-visible` outlines** — keyboard focus ring, hidden for mouse via `:focus:not(:focus-visible)`; *keyboard nav without ugly mouse outlines.*
- **`prefers-reduced-motion`** — disables transitions/smooth-scroll when requested; *avoids vestibular discomfort.*
- **Keyboard handlers on custom controls** — Enter/Space activate clickable `div`s with `role="link"` + `tabindex="0"`; *non-mouse users can use them.*
- **`iframe` `title` attribute** — names the embedded trailer; *screen-reader context.*
- **Color contrast (WCAG AA)** — ≥4.5:1 text, ≥3:1 large text & UI; *readable for low-vision users.*
- **Skip-to-content link** — first focusable jumps past the nav; *keyboard users skip repeated chrome.*
- **Associated `<label>` + accessible errors** — `<label for>`, `aria-describedby` on inputs; *forms usable with screen readers.*
- **`aria-live` regions** — announce dynamic status/toasts (e.g. "Sent"); *non-visual users hear updates.*
- **Native `<button>`/`<a>` over `div[role]`** — built-in keyboard/semantics; *less ARIA, fewer bugs.*
- **`aria-current="page"`** — marks the active nav link; *announces current location.*
- **Touch targets ≥24px** — minimum hit area (WCAG 2.5.8); *easier tapping on mobile.*
- **A11y testing** — axe/Lighthouse + keyboard & screen-reader passes; *catches regressions.*

## SEO & Discoverability

- **`robots.txt`** — `Allow: /` + `Sitemap:` line; *guides crawlers, points to sitemap.*
- **`Disallow` heavy asset dirs** — e.g. `/play/assets/`; *keeps crawl budget on real pages.*
- **`sitemap.xml`** — URL list with `<priority>`/`<lastmod>`; *complete + prioritized indexing.*
- **JSON-LD structured data** — schema.org `Organization` / `SoftwareApplication` / `WebSite`; *rich results in search.*
- **Unique `<title>` + `<meta description>` per page** — concise, page-specific; *better SERP snippets + CTR.*
- **`<meta name="author">`** — attribution metadata.
- **`app-ads.txt`** — authorized ad sellers list; *prevents ad-inventory fraud.*
- **`hreflang`** — links language/region variants; *serves the right localized page (you already have `/en/`).*
- **`meta robots noindex`** — on thin/utility pages; *keeps low-value pages out of the index.*
- **Breadcrumb / FAQ JSON-LD** — additional schema types; *breadcrumb & FAQ rich results.*
- **Host + trailing-slash canonicalization** — one URL form via 301 (www/non-www, slash); *consolidates ranking, no duplicates.*

## Social / Link Previews

- **Open Graph tags** — `og:title/description/url/image/type/site_name`; *controls Facebook/LinkedIn/Slack preview cards.*
- **Twitter Card tags** — `summary`/`summary_large_image`; *controls X/Twitter preview.*
- **Dedicated OG image** — e.g. a screenshot; *attractive shareable thumbnail.*
- **OG image 1200×630** — recommended size/ratio; *crisp, uncropped preview cards.*

## CSS & Styling

- **CSS custom properties as design tokens** — colors/spacing/shadows/transitions in `:root`; *single source of truth, easy theming.*
- **SCSS variables overriding framework** — Bootstrap `$primary`, fonts, radii in `_variables.scss`, modular base/components/layout; *themeable, organized.*
- **`box-sizing: border-box` reset** — on `*`; *padding/border don't blow out widths.*
- **`font-display: swap`** — via `@font-face` or Google Fonts `&display=swap`; *text visible during font load (no FOIT).*
- **woff2-first with ttf fallback** — `@font-face` format list; *smallest format, graceful fallback.*
- **`clamp()` fluid typography** — `clamp(3rem, 8vw, 5.5rem)`; *scales with viewport, fewer breakpoints.*
- **Mobile-first responsive breakpoints** — `min-width`/`max-width` media queries; *adapts layout per device.*
- **16:9 responsive embed** — `padding-bottom: 56.25%` wrapper around absolute iframe; *video keeps aspect ratio fluidly.*
- **CSS Grid + `subgrid`** — aligns rows across sibling cards; *consistent alignment without magic numbers.*
- **Vendor prefixes** — `-webkit-`/`-moz-` (e.g. `backdrop-filter`, `background-clip`, font-smoothing); *cross-browser support.*
- **Gradient text** — `background-clip: text` + transparent fill; *styled headings/branding.*
- **Reusable utility + component classes** — `.btn`, `.card`, spacing helpers; *consistency, less duplication.*
- **Centralized transition/easing tokens** — `--t-fast`, `--ease-out`; *uniform motion feel.*
- **`prefers-color-scheme` + `color-scheme`** — honor OS dark/light; *user comfort + native-styled controls.*
- **`aspect-ratio` property** — reserve ratio directly (replaces the `padding-bottom` hack); *cleaner, avoids CLS.*
- **Container queries (`@container`)** — style by container, not viewport; *components reusable in any context.*
- **Logical properties** — `margin-inline`/`inset`/etc.; *RTL & i18n-ready without overrides.*
- **`scroll-margin-top` on anchor targets** — offsets in-page jumps under a fixed navbar; *sections aren't hidden behind it.*
- **Modern CSS reset** — normalize cross-browser defaults; *predictable baseline.*
- **`:is()` / `:where()` / nesting** — group & flatten selectors; *less repetition, controlled specificity.*

## JavaScript

- **Vanilla JS for small interactions** — no framework where none is needed; *tiny payload, no build step.*
- **`async` on third-party scripts** — analytics/gtag; *non-blocking page render.*
- **Scripts at end of `<body>`** — after content; *DOM ready, no parser blocking.*
- **Progressive enhancement** — `try/catch` around `Flutter.postMessage`; *page still works outside the app shell.*
- **`localStorage` persistence** — editor content + console history; *state survives reloads.*
- **Platform/UA detection** — show correct app-store badge per OS; *relevant CTA per visitor.*
- **Dynamic copyright year** — `new Date().getFullYear()`; *never stale.*
- **Minified third-party libs** — `*.min.js`; *smaller transfer.*
- **Keyboard-driven UX** — arrow-up/down console history, Enter to run; *power-user ergonomics.*
- **`defer` / `type="module"`** — non-blocking, in-order, runs after parse; *cleaner than end-of-body scripts.*
- **Passive + rAF-throttled scroll/touch** — `{passive:true}`, batch work in `requestAnimationFrame`; *no scroll jank.*
- **`IntersectionObserver`** — scroll-reveal animations & lazy work; *efficient vs per-event scroll handlers.*
- **Native `fetch` over `$.ajax`** — drop jQuery for new code; *smaller, dependency-free.*
- **Central error handling** — `window.onerror` / `unhandledrejection`; *catch & report client errors.*

## Performance

- **Immutable long-cache headers** — `Cache-Control: public, max-age=31536000, immutable` on hashed CSS/JS/img/fonts; *near-zero repeat-visit requests.*
- **`rel="preconnect"`** — to font/CDN/analytics origins; *warms DNS+TLS early.*
- **`loading="lazy"`** — on below-the-fold images and iframes; *defers offscreen loads, faster first paint.*
- **CDN-hosted libraries** — Bootstrap/jQuery/CodeMirror; *edge caching, parallel download.*
- **Minified CSS/JS + woff2 fonts** — pre-compressed assets; *less bandwidth.*
- **No framework for simple pages** — hand-written CSS/JS; *minimal critical path.*
- **`<video>` (MP4/WebM) over animated GIF** — far smaller for motion clips; *major bandwidth/LCP win.*
- **Responsive images** — `srcset`/`sizes` + `<picture>`; *right resolution per device/DPR.*
- **Modern image formats (AVIF/WebP)** — with PNG/JPEG fallback; *much smaller files.*
- **`rel="preload"` critical assets** — LCP image & fonts (`as=`, `crossorigin`); *earlier fetch, faster LCP.*
- **`fetchpriority="high"` on LCP image** — prioritize the hero; *paints sooner.*
- **Subset + self-host fonts** — only needed glyphs, same origin; *smaller, fewer connections, more private.*
- **Content-hashed filenames** — pair with `immutable` caching; *safe long cache + instant cache-bust on change.*
- **`content-visibility: auto`** — skip rendering offscreen sections; *faster initial render of long pages.*
- **`decoding="async"` on images** — off-main-thread decode; *less main-thread blocking.*
- **Core Web Vitals budgets** — LCP<2.5s, CLS<0.1, INP<200ms; *concrete UX targets.*
- **Audit + field monitoring** — Lighthouse/PageSpeed/WebPageTest + `web-vitals` RUM; *find & track regressions.*

## PWA & Mobile

- **Web App Manifest** — `name/short_name/start_url/display/theme_color/background_color/icons`; *installable, app-like launch.*
- **`<meta name="theme-color">`** — colors the browser/OS UI chrome; *branded, polished.*
- **`apple-touch-icon`** — iOS home-screen icon; *correct icon when saved to home screen.*
- **SVG + `purpose` icon in manifest** — scalable maskable icon; *crisp on any density.*
- **Service worker (offline + caching)** — cache shell/assets, offline fallback page; *works offline, instant repeat loads.*

## Security

- **Security headers via host config** — `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY/SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`; *blocks MIME-sniffing, clickjacking, referrer leakage.*
- **`Permissions-Policy`** — disables unused `camera()/microphone()/geolocation()`; *shrinks attack surface.*
- **`rel="noopener noreferrer"` on `target="_blank"`** — severs `window.opener`; *prevents reverse-tabnabbing.*
- **Subresource Integrity (`integrity` + `crossorigin`)** — hash-pinned CDN `<script>`s; *blocks tampered CDN payloads.*
- **HTTPS canonical URLs everywhere** — all absolute links use `https://`; *secure transport, no mixed content.*
- **Content-Security-Policy** — allowlist script/style/connect sources; *strong XSS/injection mitigation.*
- **HSTS (`Strict-Transport-Security`)** — force HTTPS on later visits; *blocks downgrade/SSL-strip.*
- **Form anti-spam** — honeypot field / rate limit / captcha; *cuts bot submissions.*
- **`/.well-known/security.txt`** — security contact for disclosures; *responsible vuln reporting.*
- **Dependency hygiene** — pin versions + `npm audit`/Dependabot; *avoid known CVEs & supply-chain risk.*
- **Analytics consent (EU)** — consent banner + GA Consent Mode / IP anonymization; *GDPR/ePrivacy compliance.*
- **Secure cookie flags** — `Secure`/`HttpOnly`/`SameSite` when cookies are used; *limits theft & CSRF.*

## Hosting, Deploy & Tooling

- **Branded custom 404** — on-theme page with link home; *recovers lost visitors.*

---

## Anti-Patterns to Avoid

### Security & Privacy

- **`target="_blank"` without `rel`** — the opened page can manipulate `window.opener` (reverse tabnabbing); *fix: add `rel="noopener noreferrer"` — the studio site does, the game sites don't.*
- **CDN scripts without SRI** — most pages load Bootstrap/CodeMirror with no `integrity` hash, so a compromised CDN can ship arbitrary code; *fix: add `integrity` + `crossorigin` (the playground page already does).*
- **Wildcard CORS on every file** — `Access-Control-Allow-Origin: *` on `**/*.*` exposes all assets to any origin for no benefit on a static site; *fix: drop it, or scope to the assets that need cross-origin reads.*
- **Inline event handlers / inline `<script>`** — `onclick="…"` and inline blocks throughout; *block a strict Content-Security-Policy; fix: `addEventListener` + external JS.*

### Correctness

- **Unescaped interpolation into a URL** — `?message=${message}` (feedback form + playground); `&`, `#`, `+`, spaces corrupt or truncate the value; *fix: `encodeURIComponent(message)`.*
- **State-changing request over `GET`** — feedback is submitted via a GET query string; can be cached/proxied, length-limited, and logged in URLs; *fix: use `POST`.*
- **`navigator.platform` device sniffing** — deprecated and unreliable (iPadOS 13+ reports as desktop Mac, so iPads miss the iOS badge); *fix: prefer feature detection / UA-Client-Hints, and default unknowns to "show all options".*

### Semantics & Accessibility

- **Headings used for styling** — every About/Features line wrapped in `<h2>` for the font, not structure; spams the document outline and misleads screen readers; *fix: use `<p>`/`<li>` + a class.*
- **Missing `<html lang>`** — several legal/help/tool sub-pages omit it (main pages have it); *fix: set `lang` on every page.*

### CSS

- **Hex color missing `#`** — `color: 141422` is invalid and silently ignored (text falls back to inherited color); *fix: `#141422`.*
- **Repeated inline styles + dead CSS** — `.about-text`/`.feature-list` exist in `custom.css`, but the markup repeats `style="font-family:…; font-size:…"` on ~20 elements instead; *fix: apply the classes; delete or use the dead rules.*