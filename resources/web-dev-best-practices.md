# Web Dev Good Practices

## HTML & Document Structure

- **`<!DOCTYPE html>`** — standards mode declaration; _avoids browser quirks mode._
- **`<html lang="en">`** — declares page language; _screen readers + translation + SEO._
- **`<meta charset="utf-8">` first** — encoding before any text; _prevents mojibake, no re-parse._
- **Responsive viewport meta** — `width=device-width, initial-scale=1`; _correct scaling on mobile._
- **Semantic landmarks** — `<nav> <main> <section> <footer> <h1>`; _accessibility + SEO structure over `<div>` soup._
- **One `<h1>` per page, ordered headings** — logical outline; _a11y + SEO._
- **Explicit `width`/`height` on `<img>`** — reserves space; _prevents layout shift (CLS)._
- **`<link rel="canonical">`** — declares the authoritative URL; _avoids duplicate-content penalties._
- **Clean hierarchical URLs** — e.g. `/reference/collections/list/`; _readable, SEO-friendly, organizes content._
- **External CSS/JS files** — markup/style/behavior separated; _cacheable, maintainable._
- **`<noscript>` fallback** — message/content shown when JS is disabled; _core info stays reachable._

## Accessibility (a11y)

- **`alt` text describing the image** — e.g. "hex board with colored territories"; _screen readers + fallback when image fails._
- **`aria-label` on icon-only buttons** — names the hamburger toggler; _operable without a visible label._
- **`:focus-visible` outlines** — keyboard focus ring, hidden for mouse via `:focus:not(:focus-visible)`; _keyboard nav without ugly mouse outlines._
- **`prefers-reduced-motion`** — disables transitions/smooth-scroll when requested; _avoids vestibular discomfort._
- **Keyboard handlers on custom controls** — Enter/Space activate clickable `div`s with `role="link"` + `tabindex="0"`; _non-mouse users can use them._
- **`iframe` `title` attribute** — names the embedded trailer; _screen-reader context._
- **Color contrast (WCAG AA)** — ≥4.5:1 text, ≥3:1 large text & UI; _readable for low-vision users._
- **Skip-to-content link** — first focusable jumps past the nav; _keyboard users skip repeated chrome._
- **Associated `<label>` + accessible errors** — `<label for>`, `aria-describedby` on inputs; _forms usable with screen readers._
- **`aria-live` regions** — announce dynamic status/toasts (e.g. "Sent"); _non-visual users hear updates._
- **Native `<button>`/`<a>` over `div[role]`** — built-in keyboard/semantics; _less ARIA, fewer bugs._
- **`aria-current="page"`** — marks the active nav link; _announces current location._
- **Touch targets ≥24px** — minimum hit area (WCAG 2.5.8); _easier tapping on mobile._
- **A11y testing** — axe/Lighthouse + keyboard & screen-reader passes; _catches regressions._

## SEO & Discoverability

- **`robots.txt`** — `Allow: /` + `Sitemap:` line; _guides crawlers, points to sitemap._
- **`Disallow` heavy asset dirs** — e.g. `/play/assets/`; _keeps crawl budget on real pages._
- **`sitemap.xml`** — URL list with `<priority>`/`<lastmod>`; _complete + prioritized indexing._
- **JSON-LD structured data** — schema.org `Organization` / `SoftwareApplication` / `WebSite`; _rich results in search._
- **Unique `<title>` + `<meta description>` per page** — concise, page-specific; _better SERP snippets + CTR._
- **`<meta name="author">`** — attribution metadata.
- **`app-ads.txt`** — authorized ad sellers list; _prevents ad-inventory fraud._
- **`hreflang`** — links language/region variants; _serves the right localized page (you already have `/en/`)._
- **`meta robots noindex`** — on thin/utility pages; _keeps low-value pages out of the index._
- **Breadcrumb / FAQ JSON-LD** — additional schema types; _breadcrumb & FAQ rich results._
- **Host + trailing-slash canonicalization** — one URL form via 301 (www/non-www, slash); _consolidates ranking, no duplicates._

## Social / Link Previews

- **Open Graph tags** — `og:title/description/url/image/type/site_name`; _controls Facebook/LinkedIn/Slack preview cards._
- **Twitter Card tags** — `summary`/`summary_large_image`; _controls X/Twitter preview._
- **Dedicated OG image** — e.g. a screenshot; _attractive shareable thumbnail._
- **OG image 1200×630** — recommended size/ratio; _crisp, uncropped preview cards._

## CSS & Styling

- **CSS custom properties as design tokens** — colors/spacing/shadows/transitions in `:root`; _single source of truth, easy theming._
- **SCSS variables overriding framework** — Bootstrap `$primary`, fonts, radii in `_variables.scss`, modular base/components/layout; _themeable, organized._
- **`box-sizing: border-box` reset** — on `*`; _padding/border don't blow out widths._
- **`font-display: swap`** — via `@font-face` or Google Fonts `&display=swap`; _text visible during font load (no FOIT)._
- **woff2-first with ttf fallback** — `@font-face` format list; _smallest format, graceful fallback._
- **`clamp()` fluid typography** — `clamp(3rem, 8vw, 5.5rem)`; _scales with viewport, fewer breakpoints._
- **Mobile-first responsive breakpoints** — `min-width`/`max-width` media queries; _adapts layout per device._
- **16:9 responsive embed** — `padding-bottom: 56.25%` wrapper around absolute iframe; _video keeps aspect ratio fluidly._
- **CSS Grid + `subgrid`** — aligns rows across sibling cards; _consistent alignment without magic numbers._
- **Vendor prefixes** — `-webkit-`/`-moz-` (e.g. `backdrop-filter`, `background-clip`, font-smoothing); _cross-browser support._
- **Gradient text** — `background-clip: text` + transparent fill; _styled headings/branding._
- **Reusable utility + component classes** — `.btn`, `.card`, spacing helpers; _consistency, less duplication._
- **Centralized transition/easing tokens** — `--t-fast`, `--ease-out`; _uniform motion feel._
- **`prefers-color-scheme` + `color-scheme`** — honor OS dark/light; _user comfort + native-styled controls._
- **`aspect-ratio` property** — reserve ratio directly (replaces the `padding-bottom` hack); _cleaner, avoids CLS._
- **Container queries (`@container`)** — style by container, not viewport; _components reusable in any context._
- **Logical properties** — `margin-inline`/`inset`/etc.; _RTL & i18n-ready without overrides._
- **`scroll-margin-top` on anchor targets** — offsets in-page jumps under a fixed navbar; _sections aren't hidden behind it._
- **Modern CSS reset** — normalize cross-browser defaults; _predictable baseline._
- **`:is()` / `:where()` / nesting** — group & flatten selectors; _less repetition, controlled specificity._

## JavaScript

- **Vanilla JS for small interactions** — no framework where none is needed; _tiny payload, no build step._
- **`async` on third-party scripts** — analytics/gtag; _non-blocking page render._
- **Scripts at end of `<body>`** — after content; _DOM ready, no parser blocking._
- **Progressive enhancement** — `try/catch` around `Flutter.postMessage`; _page still works outside the app shell._
- **`localStorage` persistence** — editor content + console history; _state survives reloads._
- **Platform/UA detection** — show correct app-store badge per OS; _relevant CTA per visitor._
- **Dynamic copyright year** — `new Date().getFullYear()`; _never stale._
- **Minified third-party libs** — `*.min.js`; _smaller transfer._
- **Keyboard-driven UX** — arrow-up/down console history, Enter to run; _power-user ergonomics._
- **`defer` / `type="module"`** — non-blocking, in-order, runs after parse; _cleaner than end-of-body scripts._
- **Passive + rAF-throttled scroll/touch** — `{passive:true}`, batch work in `requestAnimationFrame`; _no scroll jank._
- **`IntersectionObserver`** — scroll-reveal animations & lazy work; _efficient vs per-event scroll handlers._
- **Native `fetch` over `$.ajax`** — drop jQuery for new code; _smaller, dependency-free._
- **Central error handling** — `window.onerror` / `unhandledrejection`; _catch & report client errors._

## Performance

- **Immutable long-cache headers** — `Cache-Control: public, max-age=31536000, immutable` on hashed CSS/JS/img/fonts; _near-zero repeat-visit requests._
- **`rel="preconnect"`** — to font/CDN/analytics origins; _warms DNS+TLS early._
- **`loading="lazy"`** — on below-the-fold images and iframes; _defers offscreen loads, faster first paint._
- **CDN-hosted libraries** — Bootstrap/jQuery/CodeMirror; _edge caching, parallel download._
- **Minified CSS/JS + woff2 fonts** — pre-compressed assets; _less bandwidth._
- **No framework for simple pages** — hand-written CSS/JS; _minimal critical path._
- **`<video>` (MP4/WebM) over animated GIF** — far smaller for motion clips; _major bandwidth/LCP win._
- **Responsive images** — `srcset`/`sizes` + `<picture>`; _right resolution per device/DPR._
- **Modern image formats (AVIF/WebP)** — with PNG/JPEG fallback; _much smaller files._
- **`rel="preload"` critical assets** — LCP image & fonts (`as=`, `crossorigin`); _earlier fetch, faster LCP._
- **`fetchpriority="high"` on LCP image** — prioritize the hero; _paints sooner._
- **Subset + self-host fonts** — only needed glyphs, same origin; _smaller, fewer connections, more private._
- **Content-hashed filenames** — pair with `immutable` caching; _safe long cache + instant cache-bust on change._
- **`content-visibility: auto`** — skip rendering offscreen sections; _faster initial render of long pages._
- **`decoding="async"` on images** — off-main-thread decode; _less main-thread blocking._
- **Core Web Vitals budgets** — LCP<2.5s, CLS<0.1, INP<200ms; _concrete UX targets._
- **Audit + field monitoring** — Lighthouse/PageSpeed/WebPageTest + `web-vitals` RUM; _find & track regressions._

## PWA & Mobile

- **Web App Manifest** — `name/short_name/start_url/display/theme_color/background_color/icons`; _installable, app-like launch._
- **`<meta name="theme-color">`** — colors the browser/OS UI chrome; _branded, polished._
- **`apple-touch-icon`** — iOS home-screen icon; _correct icon when saved to home screen._
- **SVG + `purpose` icon in manifest** — scalable maskable icon; _crisp on any density._
- **Service worker (offline + caching)** — cache shell/assets, offline fallback page; _works offline, instant repeat loads._

## Security

- **Security headers via host config** — `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY/SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`; _blocks MIME-sniffing, clickjacking, referrer leakage._
- **`Permissions-Policy`** — disables unused `camera()/microphone()/geolocation()`; _shrinks attack surface._
- **`rel="noopener noreferrer"` on `target="_blank"`** — severs `window.opener`; _prevents reverse-tabnabbing._
- **Subresource Integrity (`integrity` + `crossorigin`)** — hash-pinned CDN `<script>`s; _blocks tampered CDN payloads._
- **HTTPS canonical URLs everywhere** — all absolute links use `https://`; _secure transport, no mixed content._
- **Content-Security-Policy** — allowlist script/style/connect sources; _strong XSS/injection mitigation._
- **HSTS (`Strict-Transport-Security`)** — force HTTPS on later visits; _blocks downgrade/SSL-strip._
- **Form anti-spam** — honeypot field / rate limit / captcha; _cuts bot submissions._
- **`/.well-known/security.txt`** — security contact for disclosures; _responsible vuln reporting._
- **Dependency hygiene** — pin versions + `npm audit`/Dependabot; _avoid known CVEs & supply-chain risk._
- **Analytics consent (EU)** — consent banner + GA Consent Mode / IP anonymization; _GDPR/ePrivacy compliance._
- **Secure cookie flags** — `Secure`/`HttpOnly`/`SameSite` when cookies are used; _limits theft & CSRF._

## Hosting, Deploy & Tooling

- **Branded custom 404** — on-theme page with link home; _recovers lost visitors._

---

## Anti-Patterns to Avoid

### Security & Privacy

- **`target="_blank"` without `rel`** — the opened page can manipulate `window.opener` (reverse tabnabbing); _fix: add `rel="noopener noreferrer"` — the studio site does, the game sites don't._
- **CDN scripts without SRI** — most pages load Bootstrap/CodeMirror with no `integrity` hash, so a compromised CDN can ship arbitrary code; _fix: add `integrity` + `crossorigin` (the playground page already does)._
- **Wildcard CORS on every file** — `Access-Control-Allow-Origin: *` on `**/*.*` exposes all assets to any origin for no benefit on a static site; _fix: drop it, or scope to the assets that need cross-origin reads._
- **Inline event handlers / inline `<script>`** — `onclick="…"` and inline blocks throughout; _block a strict Content-Security-Policy; fix: `addEventListener` + external JS._

### Correctness

- **Unescaped interpolation into a URL** — `?message=${message}` (feedback form + playground); `&`, `#`, `+`, spaces corrupt or truncate the value; _fix: `encodeURIComponent(message)`._
- **State-changing request over `GET`** — feedback is submitted via a GET query string; can be cached/proxied, length-limited, and logged in URLs; _fix: use `POST`._
- **`navigator.platform` device sniffing** — deprecated and unreliable (iPadOS 13+ reports as desktop Mac, so iPads miss the iOS badge); _fix: prefer feature detection / UA-Client-Hints, and default unknowns to "show all options"._

### Semantics & Accessibility

- **Headings used for styling** — every About/Features line wrapped in `<h2>` for the font, not structure; spams the document outline and misleads screen readers; _fix: use `<p>`/`<li>` + a class._
- **Missing `<html lang>`** — several legal/help/tool sub-pages omit it (main pages have it); _fix: set `lang` on every page._

### CSS

- **Hex color missing `#`** — `color: 141422` is invalid and silently ignored (text falls back to inherited color); _fix: `#141422`._
- **Repeated inline styles + dead CSS** — `.about-text`/`.feature-list` exist in `custom.css`, but the markup repeats `style="font-family:…; font-size:…"` on ~20 elements instead; _fix: apply the classes; delete or use the dead rules._
