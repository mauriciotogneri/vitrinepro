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
- **Single self-contained HTML file** — all HTML, CSS, and JS in one `.html`: CSS in a single `<head>` `<style>`, JS in a single end-of-`<body>` `<script>`; no external stylesheets or scripts; _fewest requests, no render-blocking asset fetches, fastest first paint, trivial deploy. Media (images, fonts) stays external._
- **`<noscript>` fallback** — message/content shown when JS is disabled; _core info stays reachable._
- **Branded static `404.html`** — provide an on-theme fallback with a link home where the hosting platform supports custom error pages; _recovers lost visitors without depending on application code._
- **Correct native element semantics** — links navigate, buttons perform actions, and lists/tables use their corresponding elements; _provides expected browser behavior and assistive-technology semantics._
- **Explicit button types** — use `type="button"` unless a button should submit its form; _prevents accidental submissions._
- **Validate rendered HTML** — catch duplicate IDs, invalid nesting, and browser-repaired markup; _prevents inconsistent DOM behavior and accessibility failures._

## Accessibility (a11y)

- **Purposeful image alternatives** — describe informative images, use `alt=""` for decorative images, and describe the action/destination of functional images; _gives screen-reader users equivalent information without noise._
- **`aria-label` on icon-only buttons** — names the hamburger toggler; _operable without a visible label._
- **`:focus-visible` outlines** — keyboard focus ring, hidden for mouse via `:focus:not(:focus-visible)`; _keyboard nav without ugly mouse outlines._
- **`prefers-reduced-motion`** — disables transitions/smooth-scroll when requested; _avoids vestibular discomfort._
- **Keyboard support for unavoidable custom controls** — provide correct roles, states, focus behavior, and expected keys; prefer native controls whenever possible; _non-mouse users can operate them._
- **`iframe` `title` attribute** — names the embedded trailer; _screen-reader context._
- **Color contrast (WCAG AA)** — ≥4.5:1 text, ≥3:1 large text & UI; _readable for low-vision users._
- **Don't rely on color alone** — communicate errors, states, and selections with text, icons, patterns, or other cues too; _works for users who cannot distinguish the colors._
- **Skip-to-content link** — first focusable jumps past the nav; _keyboard users skip repeated chrome._
- **No positive `tabindex`** — keep it `0`/`-1`; _positive values break natural focus order._
- **Associated `<label>` + accessible errors** — `<label for>`, `aria-describedby` on inputs; _forms usable with screen readers._
- **Typed inputs + `autocomplete` + `inputmode`** — `type="email/tel/url"`, `autocomplete` tokens, `inputmode`; _correct mobile keyboard, autofill, fewer errors._
- **Group related form controls** — use `<fieldset>` and `<legend>` for related checkboxes and radio buttons; _announces the shared question or context._
- **Preserve valid user input after errors** — keep previously entered values and identify how to fix each invalid field; _avoids unnecessary re-entry._
- **`aria-live` regions** — announce dynamic status/toasts (e.g. "Sent"); _non-visual users hear updates._
- **Native `<button>`/`<a>` over `div[role]`** — built-in keyboard/semantics; _less ARIA, fewer bugs._
- **`aria-current="page"`** — marks the active nav link; _announces current location._
- **Touch targets ≥24px** — minimum hit area (WCAG 2.5.8); _easier tapping on mobile._
- **Don't disable zoom** — never `user-scalable=no` / `maximum-scale=1` in the viewport meta; _low-vision users must be able to pinch-zoom._
- **Responsive reflow and zoom** — keep content usable at 320 CSS pixels wide and 400% zoom without unnecessary two-dimensional scrolling; _supports magnification and small screens._
- **Focus management for dynamic UI** — move focus appropriately after opening dialogs, changing views, or reporting errors, then restore it when closing; _keeps keyboard and screen-reader users oriented._
- **Focus must not be obscured** — ensure sticky headers, cookie banners, and overlays do not cover the focused element; _meets WCAG 2.2 focus visibility requirements._
- **Accessible modal dialogs** — prefer `<dialog>.showModal()` with sensible initial focus, an explicit close button, and Escape support; _provides expected focus containment and dismissal._
- **No hover-only interactions** — make menus, tooltips, and controls usable with keyboard focus and touch too; _works across input methods._
- **Alternatives to dragging and complex gestures** — provide buttons or simple pointer actions for drag, multipoint, and path-based interactions; _supports users with limited dexterity._
- **Accessible media** — provide captions, transcripts, and audio descriptions where appropriate; avoid autoplay with sound; _makes audio and video perceivable and controllable._
- **Visible label matches accessible name** — ensure the accessible name contains the visible control text; _supports speech-input users._
- **Language and direction changes** — use `lang` on passages in another language and `dir` where bidirectional text requires it; _enables correct pronunciation and reading order._
- **Support forced-colors/high-contrast mode** — test controls, states, and focus indicators with browser or OS high-contrast settings; _keeps UI visible when colors are overridden._
- **A11y testing** — axe/Lighthouse + keyboard & screen-reader passes; _catches regressions._

## SEO & Discoverability

- **`robots.txt`** — `Allow: /` + `Sitemap:` line; _guides crawlers, points to sitemap._
- **Do not block required rendering assets** — keep CSS, JavaScript, and images needed to understand pages crawlable; _lets search engines render and evaluate the real content._
- **`sitemap.xml`** — list canonical URLs and include accurate `<lastmod>` dates for significant changes; omit ignored `<priority>`/`<changefreq>` values; _supports discovery without misleading metadata._
- **JSON-LD structured data** — add accurate, visible-content-backed schema.org types such as `Organization` / `SoftwareApplication` / `WebSite`; _improves machine understanding and eligibility for supported search features._
- **Unique `<title>` + `<meta description>` per page** — concise, page-specific; _better SERP snippets + CTR._
- **`<meta name="author">`** — attribution metadata.
- **`app-ads.txt` when selling app ads** — publish the authorized ad sellers list when applicable; _helps prevent ad-inventory fraud._
- **`hreflang`** — links language/region variants; _serves the right localized page (you already have `/en/`)._
- **`meta robots noindex`** — on thin/utility pages; _keeps low-value pages out of the index._
- **Eligible page-specific JSON-LD** — add supported schema types such as breadcrumbs only when they accurately match visible content; validate against current search-engine guidance; _improves machine understanding without relying on deprecated rich results._

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
- **Responsive embeds with `aspect-ratio`** — set the intended ratio on video and iframe wrappers; use the padding technique only as a legacy fallback; _keeps embeds fluid without layout shift._
- **CSS Grid + `subgrid`** — aligns rows across sibling cards; _consistent alignment without magic numbers._
- **Targeted vendor prefixes** — use tooling such as Autoprefixer or add only prefixes required by supported browsers; _avoids stale, unnecessary declarations._
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
- **Animate compositor-friendly properties** — prefer `transform` and `opacity` over layout-triggering properties; _reduces animation jank._

## JavaScript

- **Vanilla JS for small interactions** — no framework where none is needed; _tiny payload, no build step._
- **`async` on third-party scripts** — analytics/gtag; _non-blocking page render._
- **Scripts at end of `<body>`** — after content; _DOM ready, no parser blocking._
- **Progressive enhancement** — `try/catch` around `Flutter.postMessage`; _page still works outside the app shell._
- **Use browser storage deliberately** — persist non-sensitive preferences or drafts where useful; never store credentials, secrets, or sensitive personal data in `localStorage`/`sessionStorage`; _state survives reloads without exposing high-value data._
- **Reliable platform detection** — pick the app-store badge per OS via feature detection / UA-Client-Hints, not deprecated `navigator.platform` (iPadOS 13+ reports as desktop Mac); default unknowns to showing all options; _relevant CTA without misdetecting devices._
- **Dynamic copyright year** — `new Date().getFullYear()`; _never stale._
- **Minified third-party libs** — `*.min.js`; _smaller transfer._
- **Keyboard-driven UX** — arrow-up/down console history, Enter to run; _power-user ergonomics._
- **`defer` / `type="module"`** — non-blocking, in-order, runs after parse; _cleaner than end-of-body scripts._
- **Passive + rAF-throttled scroll/touch** — `{passive:true}`, batch work in `requestAnimationFrame`; _no scroll jank._
- **`IntersectionObserver`** — scroll-reveal animations & lazy work; _efficient vs per-event scroll handlers._
- **Clean up listeners/observers** — `removeEventListener`, `observer.disconnect()`, `AbortController` for `fetch`/listeners; _prevents memory leaks and dangling work on long-lived pages._
- **Native `fetch` over `$.ajax`** — drop jQuery for new code; _smaller, dependency-free._
- **No inline `on*=` handlers** — wire events with `addEventListener` from a script block or external file, not `onclick="…"`; _keeps behavior maintainable and compatible with a strict CSP._
- **Encode user values in URLs** — wrap interpolated query/path values in `encodeURIComponent()`; _`&` `#` `+` and spaces would otherwise corrupt or truncate them._
- **Mutation forms declare `method="post"`** — never place form data that changes state in a GET query string when the endpoint supports POST; _GET URLs get cached, proxied, length-capped, and logged._
- **Feature detection with fallbacks** — test whether an API exists before using it and keep core content available without it; _avoids failures in older or constrained browsers._
- **Preserve browser navigation behavior** — deep links, refresh, Back, and Forward should work predictably; _respects user expectations and makes views shareable._
- **Validate `postMessage` communication** — verify `event.origin` and send to an explicit `targetOrigin`, never unrestricted `"*"` for sensitive messages; _prevents cross-origin message abuse._
- **Validate URL protocols** — reject unsafe schemes such as `javascript:` before assigning untrusted values to `href` or `src`; _prevents script execution through crafted URLs._
- **Central client error handling** — use `window.onerror` / `unhandledrejection` to surface failures gracefully and report them only with consent and without sensitive data; _makes failures diagnosable without leaking user information._

## Performance

- **`rel="preconnect"`** — to font/CDN/analytics origins; _warms DNS+TLS early._
- **`dns-prefetch` / `prefetch` / Speculation Rules** — `dns-prefetch` as a `preconnect` fallback, `prefetch`/prerender likely-next pages; _near-instant subsequent navigations._
- **`loading="lazy"`** — on below-the-fold images and iframes; _defers offscreen loads, faster first paint._
- **Choose third-party asset hosting deliberately** — self-host for control/privacy or use a reputable CDN with pinned versions and SRI when its tradeoffs are justified; _avoids assuming a CDN is always faster or safer._
- **Minified CSS/JS + woff2 fonts** — pre-compressed assets; _less bandwidth._
- **No framework for simple pages** — hand-written CSS/JS; _minimal critical path._
- **`<video>` (MP4/WebM) over animated GIF** — far smaller for motion clips; _major bandwidth/LCP win._
- **Responsive images** — `srcset`/`sizes` + `<picture>`; _right resolution per device/DPR._
- **Modern image formats (AVIF/WebP)** — with PNG/JPEG fallback; _much smaller files._
- **`rel="preload"` critical assets** — LCP image & fonts (`as=`, `crossorigin`); _earlier fetch, faster LCP._
- **Avoid CSS `@import`; inline only genuinely critical CSS** — use a small inline critical block when measured to help, while keeping reusable styles cacheable; _reduces render blocking without duplicating the whole stylesheet._
- **`fetchpriority="high"` on LCP image** — prioritize the hero; _paints sooner._
- **Never lazy-load above-the-fold or LCP media** — reserve `loading="lazy"` for genuinely offscreen images and iframes; _avoids delaying the most important content._
- **Subset + self-host fonts** — only needed glyphs, same origin; _smaller, fewer connections, more private._
- **Content-hashed filenames** — change asset URLs when their contents change; _enables reliable cache busting regardless of host caching policy._
- **`content-visibility: auto`** — skip rendering offscreen sections; _faster initial render of long pages._
- **`decoding="async"` on images** — off-main-thread decode; _less main-thread blocking._
- **Reserve space for all embedded media** — give videos, iframes, and embeds dimensions or an `aspect-ratio`, not only images; _prevents layout shift._
- **Optimize for back/forward cache** — avoid `unload`; use `pagehide`/`pageshow` when lifecycle handling is needed; _enables near-instant Back and Forward navigation._
- **Avoid long main-thread tasks** — split expensive work, yield between chunks, or move CPU-heavy work to Web Workers; _keeps interactions responsive._
- **Minimize third-party code** — every analytics script, widget, and embed adds performance, privacy, and security cost; _reduces page weight and risk._
- **Core Web Vitals budgets** — LCP<2.5s, CLS<0.1, INP<200ms; _concrete UX targets._
- **Audit + frontend measurement** — use Lighthouse/PageSpeed/WebPageTest and browser performance APIs; send field metrics only with consent and a suitable collection service; _finds regressions without assuming server-side monitoring._

## PWA & Mobile

- **Web App Manifest** — `name/short_name/start_url/display/theme_color/background_color/icons`; _installable, app-like launch._
- **`<meta name="theme-color">`** — colors the browser/OS UI chrome; _branded, polished._
- **`apple-touch-icon`** — iOS home-screen icon; _correct icon when saved to home screen._
- **SVG + `purpose` icon in manifest** — scalable maskable icon; _crisp on any density._
- **Service worker (offline + caching)** — cache shell/assets, offline fallback page; _works offline, instant repeat loads._

## Security

- **`rel="noopener noreferrer"` on `target="_blank"`** — severs `window.opener`; _prevents reverse-tabnabbing._
- **Subresource Integrity (`integrity` + `crossorigin`)** — hash-pinned CDN `<script>`s; _blocks tampered CDN payloads._
- **HTTPS resource and canonical URLs** — use `https://` for frontend-authored absolute links and resources; _avoids introducing mixed content, while transport enforcement remains a hosting concern._
- **Meta Content-Security-Policy where headers are unavailable** — use `<meta http-equiv="Content-Security-Policy">` to restrict supported resource types; account for its limitations and avoid `unsafe-inline`; _adds frontend-controlled XSS mitigation when response headers cannot be changed._
- **Sanitize/escape untrusted HTML** — prefer `textContent`; run a sanitizer (e.g. DOMPurify) before any `innerHTML`; _prevents DOM-XSS at the source (CSP only mitigates)._
- **`/.well-known/security.txt`** — security contact for disclosures; _responsible vuln reporting._
- **Dependency hygiene** — pin versions + `npm audit`/Dependabot; _avoid known CVEs & supply-chain risk._
- **Analytics consent where required** — do not load optional tracking before consent; integrate the provider's consent controls and honor the user's choice; _supports privacy and ePrivacy compliance._
- **Restrict third-party iframes** — use the narrowest possible `sandbox`, `allow`, and `referrerpolicy` attributes; _limits embedded content's capabilities and data leakage._
- **Click-to-load third-party embeds** — do not contact video, map, or social providers until the user activates the embed; _reduces unsolicited tracking and initial page cost._
- **Consent withdrawal** — let users revoke optional tracking consent as easily as granting it; _keeps privacy choices meaningful._
