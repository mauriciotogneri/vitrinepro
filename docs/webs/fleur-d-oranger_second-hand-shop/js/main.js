/* Fleur d'Oranger — shared vanilla JS. No framework, no inline handlers.
   Progressive enhancement: every feature degrades gracefully without JS. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");
  var EN = (root.lang || "fr").toLowerCase().indexOf("en") === 0;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Dynamic copyright year ---------------------------------------- */
  var y = document.querySelector("[data-year]");
  if (y) { y.textContent = String(new Date().getFullYear()); }

  /* ---- Sticky header shadow on scroll -------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile navigation --------------------------------------------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.getElementById("nav-links");
  if (nav && toggle && navLinks) {
    var setOpen = function (open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    setOpen(false);

    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") !== "true";
      setOpen(open);
      if (open) {
        var first = navLinks.querySelector("a");
        if (first) { first.focus(); }
      }
    });

    // Close when a link is chosen
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) { setOpen(false); }
    });

    // Escape closes and restores focus to the toggle
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.getAttribute("data-open") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    // Click outside closes
    document.addEventListener("click", function (e) {
      if (nav.getAttribute("data-open") === "true" &&
          !navLinks.contains(e.target) && !toggle.contains(e.target)) {
        setOpen(false);
      }
    });

    // Reset when growing to desktop width
    window.matchMedia("(min-width: 760px)").addEventListener("change", function (e) {
      if (e.matches) { setOpen(false); }
    });
  }

  /* ---- Scroll-reveal animations -------------------------------------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reveals.length) {
    reveals.forEach(function (el) {
      var d = el.getAttribute("data-delay");
      if (d) { el.style.transitionDelay = d + "ms"; }
    });
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- Scroll-spy: mark the in-view section in the nav ---------------- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (navAnchors.length && "IntersectionObserver" in window) {
    var byId = {}, sections = [];
    navAnchors.forEach(function (a) {
      var sec = document.getElementById(a.getAttribute("href").slice(1));
      if (sec) { byId[sec.id] = a; sections.push(sec); }
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navAnchors.forEach(function (a) { a.removeAttribute("aria-current"); });
          if (byId[entry.target.id]) { byId[entry.target.id].setAttribute("aria-current", "page"); }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Open / closed badge + today's hours (Europe/Zurich) ----------- */
  // Hours: Monday–Saturday 11:00–18:00, Sunday closed.
  var OPEN_H = 11, CLOSE_H = 18;
  var dayNames = EN
    ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    : ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  function zurichNow() {
    // Reinterpret the current instant as Zurich wall-clock time.
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Zurich" }));
  }
  function isBusinessDay(d) { return d >= 1 && d <= 6; }
  function fmtHour(h) {
    if (EN) {
      var ap = h >= 12 ? "PM" : "AM";
      var hh = h % 12; if (hh === 0) { hh = 12; }
      return hh + " " + ap;
    }
    return h + " h";
  }

  var badge = document.querySelector("[data-hours-badge]");
  if (badge) {
    var now = zurichNow();
    var day = now.getDay();
    var mins = now.getHours() * 60 + now.getMinutes();
    var open = isBusinessDay(day) && mins >= OPEN_H * 60 && mins < CLOSE_H * 60;

    var lbl = badge.querySelector(".lbl");
    var sub = badge.querySelector(".sub");
    badge.setAttribute("data-state", open ? "open" : "closed");

    if (open) {
      if (lbl) { lbl.textContent = EN ? "Open now" : "Ouvert"; }
      if (sub) { sub.textContent = (EN ? "closes at " : "ferme à ") + fmtHour(CLOSE_H); }
    } else {
      var opensToday = isBusinessDay(day) && mins < OPEN_H * 60;
      if (lbl) { lbl.textContent = EN ? "Closed" : "Fermé"; }
      if (sub) {
        if (opensToday) {
          sub.textContent = (EN ? "opens at " : "ouvre à ") + fmtHour(OPEN_H);
        } else {
          var n = day;
          for (var i = 0; i < 7; i++) { n = (n + 1) % 7; if (isBusinessDay(n)) { break; } }
          sub.textContent = (EN ? "opens " : "ouvre ") + dayNames[n] + " · " + fmtHour(OPEN_H);
        }
      }
    }

    // Highlight today's row in the hours table
    var todayRow = document.querySelector('.hours-table tr[data-day="' + day + '"]');
    if (todayRow) { todayRow.classList.add("today"); }
  }

  /* ---- Contact form: AJAX submit with status (still works without JS) - */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = form.querySelector(".form-status");
    var submitBtn = form.querySelector('button[type="submit"]');
    var btnText = submitBtn ? submitBtn.textContent : "";

    var say = function (msg, tone) {
      if (!status) { return; }
      status.textContent = msg;
      status.setAttribute("data-tone", tone);
    };

    form.addEventListener("submit", function (e) {
      // Only enhance if fetch + FormData exist and the endpoint is configured.
      if (!window.fetch || !window.FormData) { return; }
      if (form.action.indexOf("{{FORMSPREE_ID}}") !== -1) { return; } // unconfigured → native POST

      e.preventDefault();
      if (submitBtn) { submitBtn.disabled = true; }
      say(EN ? "Sending…" : "Envoi en cours…", "");

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          say(EN ? "Thank you — your message has been sent." : "Merci — votre message a bien été envoyé.", "ok");
        } else {
          say(EN ? "Sorry, something went wrong. Please call or write us instead."
                 : "Désolé, une erreur est survenue. Appelez-nous ou écrivez-nous directement.", "err");
        }
      }).catch(function () {
        say(EN ? "Network error. Please call or write us instead."
               : "Erreur réseau. Appelez-nous ou écrivez-nous directement.", "err");
      }).then(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = btnText; }
      });
    });
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
