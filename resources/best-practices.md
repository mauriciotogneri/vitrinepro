# Web Dev Good Practices

## HTML & Document Structure

- **`<!DOCTYPE html>`** — standards mode declaration; _avoids browser quirks mode._
- **`<html lang="en">`** — declares page language; _screen readers + translation + SEO._
- **`<meta charset="utf-8">` first** — encoding before any text; _prevents mojibake, no re-parse._
- **Responsive viewport meta** — `width=device-width, initial-scale=1`; _correct scaling on mobile._
- **Semantic landmarks** — `<nav> <main> <section> <footer> <h1>`; _accessibility + SEO structure over `<div>` soup._
- **One `<h1>` per page, ordered headings** — logical outline; _a11y + SEO._
- **Headings for structure, not style** — use `<h1>`–`<h6>` to mark hierarchy, never to get a bigger font; style `<p>`/`<li>` with a class instead; _keeps the document outline meaningful for a11y + SEO._
- **Explicit `width`/`height` on `<img>`** — reserves space; _prevents layout shift (CLS)._
- **`<link rel="canonical">`** — declares the authoritative URL; _avoids duplicate-content penalties._
- **Clean hierarchical URLs** — e.g. `/reference/collections/list/`; _readable, SEO-friendly, organizes content._
- **External CSS/JS files** — markup/style/behavior separated; _cacheable, maintainable._
- **`<noscript>` fallback** — message/content shown when JS is disabled; _core info stays reachable._
- **Branded custom 404** — on-theme page with link home; _recovers lost visitors._

## Accessibility (a11y)

- **`alt` text describing the image** — e.g. "hex board with colored territories"; _screen readers + fallback when image fails._
- **`aria-label` on icon-only buttons** — names the hamburger toggler; _operable without a visible label._
- **`:focus-visible` outlines** — keyboard focus ring, hidden for mouse via `:focus:not(:focus-visible)`; _keyboard nav without ugly mouse outlines._
- **`prefers-reduced-motion`** — disables transitions/smooth-scroll when requested; _avoids vestibular discomfort._
- **Keyboard handlers on custom controls** — Enter/Space activate clickable `div`s with `role="link"` + `tabindex="0"`; _non-mouse users can use them._
- **`iframe` `title` attribute** — names the embedded trailer; _screen-reader context._
- **Color contrast (WCAG AA)** — ≥4.5:1 text, ≥3:1 large text & UI; _readable for low-vision users._
- **Skip-to-content link** — first focusable jumps past the nav; _keyboard users skip repeated chrome._
- **No positive `tabindex`** — keep it `0`/`-1`; _positive values break natural focus order._
- **Associated `<label>` + accessible errors** — `<label for>`, `aria-describedby` on inputs; _forms usable with screen readers._
- **Typed inputs + `autocomplete` + `inputmode`** — `type="email/tel/url"`, `autocomplete` tokens, `inputmode`; _correct mobile keyboard, autofill, fewer errors._
- **`aria-live` regions** — announce dynamic status/toasts (e.g. "Sent"); _non-visual users hear updates._
- **Native `<button>`/`<a>` over `div[role]`** — built-in keyboard/semantics; _less ARIA, fewer bugs._
- **`aria-current="page"`** — marks the active nav link; _announces current location._
- **Touch targets ≥24px** — minimum hit area (WCAG 2.5.8); _easier tapping on mobile._
- **Don't disable zoom** — never `user-scalable=no` / `maximum-scale=1` in the viewport meta; _low-vision users must be able to pinch-zoom._
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
- **Reusable classes over inline styles** — apply `.btn`/`.card`/spacing helpers instead of repeating `style="…"` across elements; _consistency, less duplication._
- **Centralized transition/easing tokens** — `--t-fast`, `--ease-out`; _uniform motion feel._
- **`prefers-color-scheme` + `color-scheme`** — honor OS dark/light; _user comfort + native-styled controls._
- **`aspect-ratio` property** — reserve ratio directly (replaces the `padding-bottom` hack); _cleaner, avoids CLS._
- **Container queries (`@container`)** — style by container, not viewport; _components reusable in any context._
- **Logical properties** — `margin-inline`/`inset`/etc.; _RTL & i18n-ready without overrides._
- **`scroll-margin-top` on anchor targets** — offsets in-page jumps under a fixed navbar; _sections aren't hidden behind it._
- **Modern CSS reset** — normalize cross-browser defaults; _predictable baseline._
- **`:is()` / `:where()` / nesting** — group & flatten selectors; _less repetition, controlled specificity._
- **Validate/lint CSS** — invalid declarations (e.g. a hex color missing its `#`) are silently dropped, not errored; _a linter catches them before the style quietly fails._
- **Prune dead CSS** — delete rules nothing uses (or apply them); _smaller payload, no confusion over what's actually live._

## JavaScript

- **Vanilla JS for small interactions** — no framework where none is needed; _tiny payload, no build step._
- **`async` on third-party scripts** — analytics/gtag; _non-blocking page render._
- **Scripts at end of `<body>`** — after content; _DOM ready, no parser blocking._
- **Progressive enhancement** — `try/catch` around `Flutter.postMessage`; _page still works outside the app shell._
- **`localStorage` persistence** — editor content + console history; _state survives reloads._
- **Reliable platform detection** — pick the app-store badge per OS via feature detection / UA-Client-Hints, not deprecated `navigator.platform` (iPadOS 13+ reports as desktop Mac); default unknowns to showing all options; _relevant CTA without misdetecting devices._
- **Dynamic copyright year** — `new Date().getFullYear()`; _never stale._
- **Minified third-party libs** — `*.min.js`; _smaller transfer._
- **Keyboard-driven UX** — arrow-up/down console history, Enter to run; _power-user ergonomics._
- **`defer` / `type="module"`** — non-blocking, in-order, runs after parse; _cleaner than end-of-body scripts._
- **Passive + rAF-throttled scroll/touch** — `{passive:true}`, batch work in `requestAnimationFrame`; _no scroll jank._
- **`IntersectionObserver`** — scroll-reveal animations & lazy work; _efficient vs per-event scroll handlers._
- **Clean up listeners/observers** — `removeEventListener`, `observer.disconnect()`, `AbortController` for `fetch`/listeners; _prevents memory leaks and dangling work on long-lived pages._
- **Native `fetch` over `$.ajax`** — drop jQuery for new code; _smaller, dependency-free._
- **No inline handlers or inline `<script>`** — wire events with `addEventListener` from external JS, not `onclick="…"`; _lets a strict CSP drop `unsafe-inline`._
- **Encode user values in URLs** — wrap interpolated query/path values in `encodeURIComponent()`; _`&` `#` `+` and spaces would otherwise corrupt or truncate them._
- **State changes use `POST`, not `GET`** — never submit form/mutation data via a query string; _GET URLs get cached, proxied, length-capped, and logged._
- **Central error handling** — `window.onerror` / `unhandledrejection`; _catch & report client errors._

## Performance

- **`rel="preconnect"`** — to font/CDN/analytics origins; _warms DNS+TLS early._
- **`dns-prefetch` / `prefetch` / Speculation Rules** — `dns-prefetch` as a `preconnect` fallback, `prefetch`/prerender likely-next pages; _near-instant subsequent navigations._
- **`loading="lazy"`** — on below-the-fold images and iframes; _defers offscreen loads, faster first paint._
- **CDN-hosted libraries** — Bootstrap/jQuery/CodeMirror; _edge caching, parallel download._
- **Minified CSS/JS + woff2 fonts** — pre-compressed assets; _less bandwidth._
- **No framework for simple pages** — hand-written CSS/JS; _minimal critical path._
- **`<video>` (MP4/WebM) over animated GIF** — far smaller for motion clips; _major bandwidth/LCP win._
- **Responsive images** — `srcset`/`sizes` + `<picture>`; _right resolution per device/DPR._
- **Modern image formats (AVIF/WebP)** — with PNG/JPEG fallback; _much smaller files._
- **`rel="preload"` critical assets** — LCP image & fonts (`as=`, `crossorigin`); _earlier fetch, faster LCP._
- **Inline critical CSS, defer the rest** — inline above-the-fold styles, load the rest async; avoid render-blocking CSS `@import`; _faster first paint._
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

- **`rel="noopener noreferrer"` on `target="_blank"`** — severs `window.opener`; _prevents reverse-tabnabbing._
- **Subresource Integrity (`integrity` + `crossorigin`)** — hash-pinned CDN `<script>`s; _blocks tampered CDN payloads._
- **HTTPS canonical URLs everywhere** — all absolute links use `https://`; _secure transport, no mixed content._
- **Content-Security-Policy** — allowlist script/style/connect sources; _strong XSS/injection mitigation._
- **Sanitize/escape untrusted HTML** — prefer `textContent`; run a sanitizer (e.g. DOMPurify) before any `innerHTML`; _prevents DOM-XSS at the source (CSP only mitigates)._
- **`/.well-known/security.txt`** — security contact for disclosures; _responsible vuln reporting._
- **Dependency hygiene** — pin versions + `npm audit`/Dependabot; _avoid known CVEs & supply-chain risk._
- **Analytics consent (EU)** — consent banner + GA Consent Mode / IP anonymization; _GDPR/ePrivacy compliance._