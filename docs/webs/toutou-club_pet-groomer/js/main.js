/* Toutou-Club — shared vanilla JS. No framework, no inline handlers. */
(function () {
  "use strict";

  var lang = (document.documentElement.lang || "fr").slice(0, 2).toLowerCase();
  var fr = lang === "fr";

  /* ---- Dynamic copyright year (never hardcoded) --------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---- Sticky header shadow ----------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile navigation -------------------------------------------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    var mq = window.matchMedia("(min-width: 861px)");
    var syncMq = function () { if (mq.matches) { setOpen(false); } };
    (mq.addEventListener ? mq.addEventListener("change", syncMq) : mq.addListener(syncMq));
  }

  /* ---- Open / closed badge (Europe/Zurich, by weekday) -------------- */
  /* Hours are appointment-only Mon–Fri; weekends closed. We surface the
     known fact (open days) without inventing precise opening/closing times. */
  try {
    var statusEls = document.querySelectorAll("[data-status]");
    if (statusEls.length) {
      var weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Zurich", weekday: "short"
      }).format(new Date());
      var openToday = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(weekday) !== -1;
      var label = openToday
        ? (fr ? "Ouvert aujourd’hui · sur rendez-vous" : "Open today · by appointment")
        : (fr ? "Fermé aujourd’hui" : "Closed today");
      statusEls.forEach(function (el) {
        el.classList.toggle("is-open", openToday);
        var txt = el.querySelector("[data-status-text]");
        if (txt) { txt.textContent = label; }
      });
    }
  } catch (e) { /* Intl unavailable — leave neutral static label */ }

  /* ---- contact form — progressive enhancement over Formspree -------- */
  (function () {
    var form = document.querySelector(".contact-form");
    if (!form) { return; }

    var status = form.querySelector(".form-status");
    var statusText = status ? status.querySelector(".form-status-text") : null;
    var submitBtn = form.querySelector('button[type="submit"]');
    var fields = [].slice.call(form.querySelectorAll("input, textarea"));

    var setStatus = function (state, msg) {
      if (!status || !statusText) { return; }
      status.dataset.state = state;
      statusText.textContent = msg;
    };
    var setBusy = function (busy) {
      if (submitBtn) {
        submitBtn.disabled = busy;
        submitBtn.setAttribute("aria-busy", String(busy));
      }
      fields.forEach(function (f) { f.disabled = busy; });
    };
    var MSG = fr ? {
      ok: "Merci, votre message a bien été envoyé ! Nous vous répondrons rapidement.",
      err: "Une erreur est survenue. Réessayez, ou appelez-nous au 022 734 31 78."
    } : {
      ok: "Thank you, your message has been sent! We'll get back to you shortly.",
      err: "Something went wrong. Please try again, or call us on 022 734 31 78."
    };

    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) { return; }
      e.preventDefault();
      var data = new FormData(form); /* capture before disabling — disabled fields are excluded from FormData */
      setStatus("", "");
      setBusy(true);
      fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      }).then(function (r) {
        if (r.ok) {
          form.reset();
          setStatus("ok", MSG.ok);
        } else {
          setStatus("error", MSG.err);
        }
      }).catch(function () {
        setStatus("error", MSG.err);
      }).finally(function () {
        setBusy(false);
      });
    });
  })();

  /* ---- Scroll reveals (IntersectionObserver + fallback) ------------- */
  var reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) { return; }
  if (!("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  reveals.forEach(function (el) { io.observe(el); });
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
