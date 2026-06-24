/* Le Panapé de Caméla — shared vanilla JS (no framework).
   Progressive enhancement: the page is fully usable without this file. */
(function () {
  "use strict";

  var docEl = document.documentElement;
  var supportsIO = "IntersectionObserver" in window;
  docEl.classList.add("js");

  /* ---- 1. Dynamic copyright year (never hardcoded) ---- */
  var year = String(new Date().getFullYear());
  var slots = document.querySelectorAll("[data-year]");
  for (var i = 0; i < slots.length; i++) slots[i].textContent = year;

  /* ---- 2. Scroll-reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (!supportsIO) {
    for (var r = 0; r < reveals.length; r++) reveals[r].classList.add("is-visible");
  } else if (reveals.length) {
    var revObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    for (var k = 0; k < reveals.length; k++) revObserver.observe(reveals[k]);
  }

  /* ---- 3. Mobile navigation ---- */
  var nav = document.querySelector(".nav");
  var toggle = nav && nav.querySelector(".nav-toggle");
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    var links = nav.querySelectorAll(".nav-links a");
    for (var n = 0; n < links.length; n++) {
      links[n].addEventListener("click", function () { setOpen(false); });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920 && nav.classList.contains("is-open")) setOpen(false);
    });
  }

  /* ---- 4. Scroll-spy: mark the in-view section's nav link ---- */
  var navAnchors = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );
  if (supportsIO && navAnchors.length) {
    var linkFor = function (id) {
      for (var a = 0; a < navAnchors.length; a++) {
        if (navAnchors[a].getAttribute("href") === "#" + id) return navAnchors[a];
      }
      return null;
    };
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var active = linkFor(entry.target.id);
          if (!active) return;
          for (var a = 0; a < navAnchors.length; a++) navAnchors[a].removeAttribute("aria-current");
          active.setAttribute("aria-current", "page");
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    var sections = document.querySelectorAll("main section[id]");
    for (var s = 0; s < sections.length; s++) spy.observe(sections[s]);
  }

  /* ---- 5. Open / closed badge (Europe/Zurich) ---- */
  /* minutes-from-midnight ranges, keyed by weekday (0=Sun … 6=Sat) */
  var SCHEDULE = {
    0: [],                 // Sunday — closed
    1: [[840, 1110]],      // Monday 14:00–18:30
    2: [[630, 1110]],      // Tue 10:30–18:30
    3: [[630, 1110]],
    4: [[630, 1110]],
    5: [[630, 1110]],
    6: [[630, 1080]]       // Sat 10:30–18:00
  };
  var WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  var badge = document.querySelector(".open-badge");
  try {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Zurich",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date());

    var wd = null, hh = 0, mm = 0;
    parts.forEach(function (p) {
      if (p.type === "weekday") wd = WEEKDAY_INDEX[p.value];
      else if (p.type === "hour") hh = parseInt(p.value, 10);
      else if (p.type === "minute") mm = parseInt(p.value, 10);
    });
    if (hh === 24) hh = 0;

    if (wd !== null) {
      var now = hh * 60 + mm;
      var ranges = SCHEDULE[wd] || [];
      var isOpen = ranges.some(function (rg) { return now >= rg[0] && now < rg[1]; });

      if (badge) {
        var labelOpen = badge.getAttribute("data-open") || "Open";
        var labelClosed = badge.getAttribute("data-closed") || "Closed";
        var labelSpan = badge.querySelector(".open-label");
        badge.setAttribute("data-state", isOpen ? "open" : "closed");
        if (labelSpan) labelSpan.textContent = isOpen ? labelOpen : labelClosed;
        badge.hidden = false;
      }

      var today = document.querySelector('.hours-list li[data-day="' + wd + '"]');
      if (today) today.classList.add("is-today");
    }
  } catch (err) {
    if (badge) badge.hidden = true; /* Intl unsupported — hide rather than mislead */
  }
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
