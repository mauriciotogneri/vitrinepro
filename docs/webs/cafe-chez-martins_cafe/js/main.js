/* Café Chez Martins — shared vanilla JS (no framework, no inline handlers).
   Locale is read from <html lang>; user-facing strings live in data-* attrs
   or the small I18N map below so both fr-CH and EN stay in sync. */
(function () {
  "use strict";

  var lang = (document.documentElement.lang || "fr").toLowerCase();
  var isFR = lang.indexOf("fr") === 0;

  var I18N = isFR ? {
    open: "Ouvert", closed: "Fermé",
    closes: "ferme à", opens: "ouvre à", opensOn: "ouvre",
    today: "", tomorrow: "demain",
    sending: "Envoi…",
    ok: "Merci ! Votre message a bien été envoyé. Nous vous recontactons rapidement.",
    err: "Désolé, l’envoi a échoué. Appelez-nous au +41 22 320 76 21 ou réessayez."
  } : {
    open: "Open now", closed: "Closed",
    closes: "closes", opens: "opens", opensOn: "opens",
    today: "", tomorrow: "tomorrow",
    sending: "Sending…",
    ok: "Thank you! Your message has been sent. We’ll get back to you shortly.",
    err: "Sorry, sending failed. Please call us on +41 22 320 76 21 or try again."
  };

  /* ---------- dynamic year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* ---------- header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile nav ---------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", function () {
      setOpen(nav.getAttribute("data-open") !== "true");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.getAttribute("data-open") === "true") {
        setOpen(false); toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.getAttribute("data-open") === "true" && !nav.contains(e.target)) setOpen(false);
    });
  }

  /* ---------- scroll reveals ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  /* ---------- scrollspy (aria-current on in-page nav) ---------- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var sections = spyLinks.map(function (a) {
    var id = a.getAttribute("href").slice(1);
    return id ? document.getElementById(id) : null;
  });
  if ("IntersectionObserver" in window && sections.some(Boolean)) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = sections.indexOf(en.target);
        spyLinks.forEach(function (a, j) {
          if (a.classList.contains("btn")) return;
          if (j === i) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- open / closed badge (Europe/Zurich) ---------- */
  // intervals in minutes from midnight, indexed 0=Sun … 6=Sat.
  // Café hours: closed Mon; Tue–Fri 06–16; Sat 07–16; Sun 08–16. (All close at 16:00.)
  var CLOSE = 16 * 60;
  var SCHEDULE = {
    0: [[8 * 60, CLOSE]],
    1: [],
    2: [[6 * 60, CLOSE]],
    3: [[6 * 60, CLOSE]],
    4: [[6 * 60, CLOSE]],
    5: [[6 * 60, CLOSE]],
    6: [[7 * 60, CLOSE]]
  };
  function fmtTime(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
  }
  function zurichNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Zurich", weekday: "short",
        hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var hh = parseInt(map.hour, 10) % 24;
      return { day: days[map.weekday], min: hh * 60 + parseInt(map.minute, 10) };
    } catch (e) { return null; }
  }
  function weekdayName(dayIdx) {
    // dayIdx: 0=Sun … 6=Sat ; reference 2024-01-07 is a Sunday
    var f = new Intl.DateTimeFormat(lang, { weekday: "long" });
    return f.format(new Date(Date.UTC(2024, 0, 7 + dayIdx)));
  }
  (function () {
    var badge = document.querySelector(".chip--live");
    if (!badge) return;
    var label = badge.querySelector(".txt");
    var now = zurichNow();
    if (!now || !label) return;

    var todays = SCHEDULE[now.day] || [];
    var i, iv, openNow = null;
    for (i = 0; i < todays.length; i++) {
      iv = todays[i];
      if (now.min >= iv[0] && now.min < iv[1]) { openNow = iv; break; }
    }
    if (openNow) {
      badge.classList.add("is-open");
      label.textContent = I18N.open + " · " + I18N.closes + " " + fmtTime(openNow[1]);
      return;
    }
    badge.classList.add("is-closed");
    // find next opening within 7 days
    for (var off = 0; off <= 7; off++) {
      var d = (now.day + off) % 7;
      var ivs = SCHEDULE[d] || [];
      for (i = 0; i < ivs.length; i++) {
        if (off === 0 && ivs[i][0] <= now.min) continue;
        var whenTime = fmtTime(ivs[i][0]);
        var when;
        if (off === 0) when = I18N.opens + " " + whenTime;
        else if (off === 1) when = I18N.opensOn + " " + I18N.tomorrow + " " + whenTime;
        else when = I18N.opensOn + " " + weekdayName(d) + " " + whenTime;
        label.textContent = I18N.closed + " · " + when;
        return;
      }
    }
    label.textContent = I18N.closed;
  })();

  /* ---------- highlight today's row in the hours table ---------- */
  (function () {
    var now = zurichNow();
    if (!now) return;
    var row = document.querySelector('.hours tr[data-day="' + now.day + '"]');
    if (row) row.classList.add("today");
  })();

  /* ---------- contact form (progressive enhancement over Formspree) ---------- */
  (function () {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var status = form.querySelector(".form-status");
    var submit = form.querySelector('button[type="submit"]');
    var submitLabel = submit ? submit.textContent : "";

    function show(kind, msg) {
      if (!status) return;
      status.className = "form-status show " + kind;
      status.textContent = msg;
    }
    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) return; // let the browser report invalid fields
      e.preventDefault();
      if (submit) { submit.disabled = true; submit.textContent = I18N.sending; }
      if (status) status.className = "form-status";
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (r) {
        if (r.ok) { show("ok", I18N.ok); form.reset(); }
        else { show("err", I18N.err); }
      }).catch(function () {
        show("err", I18N.err);
      }).then(function () {
        if (submit) { submit.disabled = false; submit.textContent = submitLabel; }
      });
    });
  })();
})();

/* ---- photo lightbox: click / Enter / Space to enlarge any content image ----
   Self-contained and identical across every site. Hooks every <picture>
   (content photos only — logos, icons and the map are never wrapped in
   <picture>) and reuses the already-loaded asset, so it adds no image weight. */
(function () {
  'use strict';
  var doc = document;
  var zoomables = [].slice.call(doc.querySelectorAll('picture img'));
  if (!zoomables.length) { return; }

  var fr = (doc.documentElement.lang || 'fr').toLowerCase().indexOf('fr') === 0;
  var T = fr
    ? { zoom: 'Agrandir : ', enlarge: 'Agrandir l’image', close: 'Fermer', title: 'Image agrandie' }
    : { zoom: 'Enlarge: ', enlarge: 'Enlarge image', close: 'Close', title: 'Enlarged image' };

  var canModal = typeof HTMLDialogElement === 'function' &&
    typeof HTMLDialogElement.prototype.showModal === 'function';

  var lb = null, lbImg = null, lbCap = null, lastFocus = null;

  var closeLb = function () { if (lb && lb.open) { lb.close(); } };

  var buildLb = function () {
    lb = doc.createElement('dialog');
    lb.className = 'lightbox';
    lb.setAttribute('aria-label', T.title);

    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'lightbox__close';
    btn.setAttribute('aria-label', T.close);
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M6 6l12 12M18 6L6 18"/></svg>';

    var fig = doc.createElement('figure');
    fig.className = 'lightbox__fig';
    lbImg = doc.createElement('img');
    lbImg.className = 'lightbox__img';
    lbImg.decoding = 'async';
    lbImg.alt = '';
    lbCap = doc.createElement('figcaption');
    lbCap.className = 'lightbox__cap';
    fig.appendChild(lbImg);
    fig.appendChild(lbCap);

    lb.appendChild(btn);
    lb.appendChild(fig);
    doc.body.appendChild(lb);

    btn.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) { closeLb(); } });
    lb.addEventListener('close', function () {
      doc.documentElement.classList.remove('lightbox-open');
      if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
    });
  };

  var openLb = function (img) {
    if (lb && lb.open) { return; }            /* already showing — don't re-enter showModal() */
    var src = img.currentSrc || img.src;
    if (!src) { return; }
    if (!canModal) { window.open(src, '_blank', 'noopener'); return; } /* graceful fallback */
    if (!lb) { buildLb(); }
    lbImg.src = src;
    var w = img.getAttribute('width'), h = img.getAttribute('height');
    if (w && h) { lbImg.setAttribute('width', w); lbImg.setAttribute('height', h); } /* reserve ratio (CLS) */
    else { lbImg.removeAttribute('width'); lbImg.removeAttribute('height'); }
    lbImg.alt = '';                           /* the visible caption below carries the description */
    var alt = img.getAttribute('alt') || '';
    lbCap.textContent = alt;
    lbCap.hidden = !alt;
    lastFocus = img;
    doc.documentElement.classList.add('lightbox-open');
    lb.showModal(); /* native focus-trap, Esc-to-close and ::backdrop */
  };

  zoomables.forEach(function (img) {
    img.classList.add('is-zoomable');
    img.setAttribute('role', 'button');
    img.setAttribute('tabindex', '0');
    img.setAttribute('aria-haspopup', 'dialog');
    var alt = img.getAttribute('alt') || '';
    img.setAttribute('aria-label', alt ? (T.zoom + alt) : T.enlarge);
  });

  doc.addEventListener('click', function (e) {
    var img = e.target.closest ? e.target.closest('img.is-zoomable') : null;
    if (img) { e.preventDefault(); openLb(img); }
  });
  /* Enter activates on keydown; Space on keyup — matches native <button> keys */
  doc.addEventListener('keydown', function (e) {
    var el = doc.activeElement;
    if (!el || !el.classList || !el.classList.contains('is-zoomable')) { return; }
    if (e.key === 'Enter') { e.preventDefault(); openLb(el); }
    else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); } /* hold Space, suppress page scroll */
  });
  doc.addEventListener('keyup', function (e) {
    if (e.key !== ' ' && e.key !== 'Spacebar') { return; }
    var el = doc.activeElement;
    if (el && el.classList && el.classList.contains('is-zoomable')) { e.preventDefault(); openLb(el); }
  });
})();
