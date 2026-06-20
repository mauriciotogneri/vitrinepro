#!/usr/bin/env node
// render.mjs — no-login headless render assist for the `extract-data` skill.
//
// Loads ONE public URL in headless Chromium and prints a JSON payload with:
//   - facts:    title, meta tags, JSON-LD blocks, visible text, links
//   - branding: signals from COMPUTED styles (palette, fonts, theme-color, shape, depth)
//
// Best-effort fetch of a PUBLIC page — NO login, NO anti-bot bypass. Same posture
// as `curl`, just with a JS engine, so it recovers facts/branding from JS-rendered
// public sites (the business's own site, JS-rendered directories) that a plain
// fetch returns thin/empty, and (with --follow-posts) the first page of public
// Facebook/Instagram post images a logged-out visitor can see. It does NOT log in,
// so content that truly requires a session stays out of reach.
//
// Usage:  node render.mjs <url> [--timeout=30000] [--follow-posts] [--max-posts=24]
//   --follow-posts: after rendering a profile/page, also visit each Instagram /p/
//   or /reel/ post permalink (and Facebook fbid= photo permalink) it links to and
//   read its image — og:image when present (Instagram), else the scontent…fbcdn.net
//   URL scanned from the page markup (Facebook leaves og:image empty but still
//   embeds the photo URL in the logged-out page). Each post returns
//   { permalink, image, caption, images[] }. Recovers the first page of PUBLIC
//   (logged-out) post images from Instagram and Facebook. Still no login.
// Output: JSON to stdout. On block/empty/error: {"ok":false,"error":...} + exit 1.

import { chromium } from 'playwright';

const url = process.argv[2];
if (!url) {
  process.stderr.write('usage: node render.mjs <url> [--timeout=ms]\n');
  process.exit(2);
}
// Parse a numeric flag, honoring an explicit 0 (Number(x) || default would drop it).
const numArg = (flag, dflt) => {
  const v = (process.argv.find((a) => a.startsWith(flag)) || '').split('=')[1];
  const n = Number(v);
  return v !== undefined && v !== '' && Number.isFinite(n) && n >= 0 ? n : dflt;
};
const TIMEOUT = numArg('--timeout=', 30000);
const FOLLOW_POSTS = process.argv.includes('--follow-posts');
const MAX_POSTS = numArg('--max-posts=', 24);

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      locale: 'fr-CH',
      viewport: { width: 1366, height: 900 },
    });

    // Light/fast: drop image, media and font *files*. We read declared font-family
    // names from CSS (not the font binaries) and image URLs from markup (not pixels),
    // so none of this affects the extracted facts or branding.
    await context.route('**/*', (route) => {
      const t = route.request().resourceType();
      return t === 'image' || t === 'media' || t === 'font' ? route.abort() : route.continue();
    });

    const page = await context.newPage();

    let status = null;
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: TIMEOUT });
      status = resp ? resp.status() : null;
    } catch {
      // `networkidle` can time out on chatty sites; fall back to a lighter wait.
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
      status = resp ? resp.status() : null;
    }
    if (status && status >= 400) {
      throw Object.assign(new Error('http ' + status), { extra: { status } });
    }

    // Give late client-rendered content a brief moment to settle.
    await page.waitForTimeout(1500);

    const data = await page.evaluate(() => {
      const txt = (s) => (s || '').trim();
      const abs = (h) => {
        try {
          return new URL(h, document.baseURI).href;
        } catch {
          return null;
        }
      };
      // rgb()/rgba() -> #rrggbb; transparent (alpha 0) -> null; pass hex/named through.
      const col = (c) => {
        if (!c) return null;
        const m = c.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/);
        if (!m) return c;
        const a = m[4] === undefined ? 1 : parseFloat(m[4]);
        if (a === 0) return null;
        const hx = (n) => Math.max(0, Math.min(255, Math.round(+n))).toString(16).padStart(2, '0');
        return '#' + hx(m[1]) + hx(m[2]) + hx(m[3]);
      };

      // ---- FACTS ----
      const metas = {};
      document.querySelectorAll('meta[name], meta[property]').forEach((m) => {
        const k = m.getAttribute('name') || m.getAttribute('property');
        const v = m.getAttribute('content');
        if (k && v && !(k in metas)) metas[k] = v;
      });
      const jsonLd = [];
      document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
        try {
          jsonLd.push(JSON.parse(s.textContent));
        } catch {
          /* ignore malformed JSON-LD */
        }
      });
      const links = [];
      const seenL = new Set();
      document.querySelectorAll('a[href]').forEach((a) => {
        const href = abs(a.getAttribute('href'));
        if (!href || seenL.has(href)) return;
        seenL.add(href);
        links.push({ href, text: txt(a.textContent).slice(0, 120) });
      });
      const bodyText = txt(document.body ? document.body.innerText : '').slice(0, 20000);

      // ---- BRANDING (computed styles) ----
      const cssVars = {};
      try {
        for (const sheet of Array.from(document.styleSheets)) {
          let rules;
          try {
            rules = sheet.cssRules;
          } catch {
            continue; // cross-origin sheet — not readable
          }
          if (!rules) continue;
          for (const rule of Array.from(rules)) {
            if (rule.style && rule.selectorText && /(^|,)\s*:root\b/.test(rule.selectorText)) {
              for (const prop of Array.from(rule.style)) {
                if (prop.startsWith('--')) cssVars[prop] = rule.style.getPropertyValue(prop).trim();
              }
            }
          }
        }
      } catch {
        /* styleSheets not enumerable — skip CSS vars */
      }

      const sample = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        return {
          color: col(cs.color),
          backgroundColor: col(cs.backgroundColor),
          borderColor: col(cs.borderTopColor),
          fontFamily: cs.fontFamily,
          fontWeight: cs.fontWeight,
          borderRadius: cs.borderTopLeftRadius,
          boxShadow: cs.boxShadow === 'none' ? null : cs.boxShadow,
        };
      };
      const roles = {
        body: sample('body'),
        heading: sample('h1') || sample('h2') || sample('h3'),
        link: sample('a'),
        button: sample('button') || sample('.btn, .button, [class*="btn"], [role="button"]'),
        surface: sample('.card, [class*="card"], article, section'),
      };
      const themeColor = (document.querySelector('meta[name="theme-color"]') || {}).content || null;
      const googleFonts = !!document.querySelector(
        'link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]',
      );

      return {
        title: txt(document.title),
        metas,
        jsonLd,
        links: links.slice(0, 200),
        bodyText,
        branding: { cssVars, roles, themeColor, googleFonts },
      };
    });

    // Opt-in second pass: visit each post permalink this page links to and extract
    // its image. No login. Instagram exposes the photo as the post's og:image;
    // Facebook leaves og:image empty but still embeds the scontent…fbcdn.net URL in
    // the logged-out page markup, which the per-post scan below recovers. A final
    // step demotes the page cover/avatar so it doesn't masquerade as a post photo.
    let posts;
    if (FOLLOW_POSTS) {
      const origin = new URL(url).origin;
      const seen = new Set();
      const permalinks = [];
      for (const l of data.links) {
        let u;
        try {
          u = new URL(l.href);
        } catch {
          continue;
        }
        if (u.origin !== origin) continue; // same site only
        // Genuine post permalinks only, deduped by post id, and host-gated so a
        // non-social site's /p/<product> URLs aren't mistaken for posts: Instagram
        // /p/ or /reel/ <code>, or a Facebook fbid= photo. NOT /photos* tab pages,
        // and not the same photo re-listed under different ?set= albums (same fbid).
        const host = u.hostname;
        const ig = /(^|\.)instagram\.com$/i.test(host)
          ? u.pathname.match(/\/(?:p|reel)\/([^/?#]+)/)
          : null;
        const fb = /(^|\.)facebook\.com$/i.test(host) ? u.search.match(/[?&]fbid=(\d+)/) : null;
        if (!ig && !fb) continue;
        const key = ig ? 'ig:' + ig[1] : 'fb:' + fb[1];
        if (seen.has(key)) continue;
        seen.add(key);
        permalinks.push(u.href);
        if (permalinks.length >= MAX_POSTS) break;
      }
      posts = [];
      const postTimeout = Math.min(TIMEOUT, 15000);
      for (const link of permalinks) {
        try {
          await page.goto(link, { waitUntil: 'domcontentloaded', timeout: postTimeout });
          await page.waitForTimeout(1000);
          const meta = await page.evaluate(() => {
            const g = (p) =>
              (document.querySelector(`meta[property="${p}"]`) ||
                document.querySelector(`meta[name="${p}"]`) ||
                {}).content || null;
            // Content-photo CDN URLs embedded in the page markup — present even
            // behind a logged-out wall (in <img> and inline-script JSON). This is
            // how Facebook photos are recovered when og:image is empty. FB/IG UI
            // assets live on static.xx.fbcdn.net, which the scontent/cdninstagram
            // prefixes already exclude.
            // Normalize JSON-escaped slashes (\/) and & (&) common in FB/IG
            // inline-script payloads, so photo URLs embedded only in script JSON
            // (not just <img>) still match.
            const html = document.documentElement.outerHTML
              .replace(/\\\//g, '/')
              .replace(/\\u0026/gi, '&');
            const pats = [
              /https:\/\/scontent[^"'\\\s)]*\.(?:jpg|jpeg|webp|png)[^"'\\\s)]*/gi,
              /https:\/\/[^"'\\\s)]*cdninstagram\.com[^"'\\\s)]*\.(?:jpg|jpeg|webp|png)[^"'\\\s)]*/gi,
            ];
            const imgs = new Set();
            for (const re of pats) {
              if (imgs.size >= 20) break;
              for (const raw of html.match(re) || []) {
                if (imgs.size >= 20) break;
                imgs.add(raw.replace(/&amp;/g, '&'));
              }
            }
            const og = g('og:image');
            const images = [...imgs];
            return {
              image: og, // primary filled in post-processing when og:image is empty
              caption: g('og:description') || g('og:title'),
              images,
            };
          });
          posts.push({
            permalink: link,
            image: meta.image,
            caption: meta.caption,
            images: meta.images,
          });
        } catch (e) {
          posts.push({
            permalink: link,
            image: null,
            caption: null,
            images: [],
            error: (e && e.message ? e.message : String(e)).slice(0, 120),
          });
        }
        await page.waitForTimeout(600); // be polite between post fetches
      }

      // Choose each post's primary `image` and de-noise its `images`. "Chrome" is
      // the page's own cover/avatar (the main render's og:image) OR any image
      // recurring across most posts (UI furniture / "suggested" thumbnails baked
      // into every photo page). A real post photo appears only on its own page, so
      // the high recurrence bar (70%) won't demote a genuine photo that happens to
      // show on a sibling page. Key by CDN image id (filename's leading digits) so
      // size/crop variants collapse. og:image (Instagram's real image) always wins.
      const idOf = (u) => {
        const m = (u || '').match(/\/(\d{6,})_/);
        return m ? m[1] : u;
      };
      const coverId = idOf((data.metas && data.metas['og:image']) || '');
      const freq = new Map();
      for (const p of posts) {
        for (const id of new Set((p.images || []).map(idOf))) freq.set(id, (freq.get(id) || 0) + 1);
      }
      const recur = Math.max(2, Math.ceil(posts.length * 0.7));
      const isChrome = (u) => {
        const id = idOf(u);
        return id === coverId || (freq.get(id) || 0) >= recur;
      };
      for (const p of posts) {
        // collapse size/crop variants of the same image (same id), keep order
        const seenId = new Set();
        p.images = (p.images || []).filter((u) => {
          const id = idOf(u);
          if (seenId.has(id)) return false;
          seenId.add(id);
          return true;
        });
        if (!p.image) p.image = p.images.find((u) => !isChrome(u)) || p.images[0] || null;
      }
    }

    return { ok: true, url, status, ...data, ...(FOLLOW_POSTS ? { posts } : {}) };
  } finally {
    await browser.close().catch(() => {
      /* already closed */
    });
  }
}

// Single output sink. Use `process.exitCode` (not `process.exit`) so Node drains
// stdout before exiting — `process.exit` after a `console.log` truncates a piped
// payload, which would drop the `{"ok":false,...}` line the caller reads.
run()
  .then((result) => {
    process.stdout.write(JSON.stringify(result) + '\n');
  })
  .catch((e) => {
    process.exitCode = 1;
    const extra = e && e.extra ? e.extra : {};
    const message = e && e.message ? e.message : String(e);
    process.stdout.write(JSON.stringify({ ok: false, url, error: message, ...extra }) + '\n');
  });
