/* ---- Dragon — main behaviour: year, header, mobile nav, scrollspy, reveal, tabs ---- */
(function () {
  'use strict';
  var doc = document;

  /* dynamic copyright year */
  doc.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* header solid-on-scroll */
  var header = doc.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* mobile nav toggle */
  var toggle = doc.querySelector('.nav-toggle');
  var mobileNav = doc.getElementById('mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      mobileNav.classList.toggle('is-open', !open);
      doc.documentElement.classList.toggle('scroll-lock', !open);
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('is-open');
        doc.documentElement.classList.remove('scroll-lock');
      });
    });
  }

  /* scrollspy: mark the in-view section's nav link */
  var navLinks = [].slice.call(doc.querySelectorAll('.site-nav a[href^="#"], .mobile-nav a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var setCurrent = function (id) {
      navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
      var matches = doc.querySelectorAll('a[href="#' + id + '"]');
      matches.forEach(function (a) { a.setAttribute('aria-current', 'true'); });
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { setCurrent(entry.target.id); }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* scroll reveal (section-level, restrained) */
  var revealEls = [].slice.call(doc.querySelectorAll('.reveal'));
  if (revealEls.length) {
    if ('IntersectionObserver' in window && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      var ro = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { ro.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* menu tabs */
  var tablist = doc.querySelector('.tabs');
  if (tablist) {
    var tabs = [].slice.call(tablist.querySelectorAll('.tab-btn'));
    var panels = tabs.map(function (t) { return doc.getElementById(t.getAttribute('aria-controls')); });
    var selectTab = function (index) {
      tabs.forEach(function (t, i) {
        var selected = i === index;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        if (panels[i]) { panels[i].hidden = !selected; }
      });
      tabs[index].focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o, j) {
          o.setAttribute('aria-selected', String(j === i));
          o.tabIndex = j === i ? 0 : -1;
          if (panels[j]) { panels[j].hidden = j !== i; }
        });
      });
      t.addEventListener('keydown', function (e) {
        var last = tabs.length - 1;
        if (e.key === 'ArrowRight') { e.preventDefault(); selectTab(i === last ? 0 : i + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); selectTab(i === 0 ? last : i - 1); }
        else if (e.key === 'Home') { e.preventDefault(); selectTab(0); }
        else if (e.key === 'End') { e.preventDefault(); selectTab(last); }
      });
    });
  }

  /* contact form — progressive enhancement over Formspree */
  var form = doc.querySelector('.contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    var statusText = status ? status.querySelector('.form-status-text') : null;
    var submitBtn = form.querySelector('button[type="submit"]');
    var fields = [].slice.call(form.querySelectorAll('input, textarea'));

    var setStatus = function (state, msg) {
      if (!status || !statusText) { return; }
      status.dataset.state = state;
      statusText.textContent = msg;
    };
    var setBusy = function (busy) {
      if (submitBtn) {
        submitBtn.disabled = busy;
        submitBtn.setAttribute('aria-busy', String(busy));
      }
      fields.forEach(function (f) { f.disabled = busy; });
    };

    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) { return; }
      e.preventDefault();
      var data = new FormData(form); /* capture before disabling — disabled fields are excluded from FormData */
      setStatus('', '');
      setBusy(true);
      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      }).then(function (r) {
        if (r.ok) {
          form.reset();
          setStatus('ok', 'Merci, votre message a bien été envoyé ! Nous vous répondrons rapidement.');
        } else {
          setStatus('error', 'Une erreur est survenue. Réessayez, ou appelez-nous au 022 700 27 14.');
        }
      }).catch(function () {
        setStatus('error', 'Une erreur est survenue. Réessayez, ou appelez-nous au 022 700 27 14.');
      }).finally(function () {
        setBusy(false);
      });
    });
  }
})();

/* ── Open / closed status chip ──────────────────────────────────────────────
   Copied verbatim from references/snippets/open-status.js — only HOURS edited.
   Dragon: 11:00–15:00 and 18:00–23:00, every day (search.ch, local.ch, TripAdvisor,
   Google mirrors and the storefront signage all agree — see dossier § Opening hours).
   ──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var doc = document;

  var HOURS = {
    0: [[660, 900], [1080, 1380]],
    1: [[660, 900], [1080, 1380]],
    2: [[660, 900], [1080, 1380]],
    3: [[660, 900], [1080, 1380]],
    4: [[660, 900], [1080, 1380]],
    5: [[660, 900], [1080, 1380]],
    6: [[660, 900], [1080, 1380]]
  };

  var DAY_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  var SOON_MIN = 30;

  function zoneParts(date) {
    var o = {};
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Zurich', weekday: 'short',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(date).forEach(function (p) { o[p.type] = p.value; });
    return o;
  }
  function zoneOffsetMin(date) {
    var p = zoneParts(date);
    var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
    var dateMin = Math.floor(date.getTime() / 60000) * 60000;
    return Math.round((asUTC - dateMin) / 60000);
  }
  function fmtClock(refDate, minutesOfDay) {
    var p = zoneParts(refDate);
    var off = zoneOffsetMin(refDate);
    var utcMs = Date.UTC(+p.year, +p.month - 1, +p.day,
      Math.floor(minutesOfDay / 60), minutesOfDay % 60) - off * 60000;
    return new Intl.DateTimeFormat(navigator.language || 'fr-CH', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich'
    }).format(new Date(utcMs));
  }

  function computeStatus() {
    var now = new Date();
    var p = zoneParts(now);
    var todayIdx = WD[p.weekday];
    if (todayIdx == null) return null;
    var mins = (+p.hour % 24) * 60 + (+p.minute);
    var today = HOURS[todayIdx] || [];
    var i;
    for (i = 0; i < today.length; i++) {
      var o = today[i][0], c = today[i][1];
      if (mins >= o && mins < c) {
        if (c - mins <= SOON_MIN) return { state: 'soon', label: 'Ferme bientôt · ' + fmtClock(now, c) };
        return { state: 'open', label: 'Ouvert · ferme à ' + fmtClock(now, c) };
      }
    }
    for (i = 0; i < today.length; i++) {
      if (today[i][0] > mins) {
        return { state: 'closed', label: 'Fermé · ouvre à ' + fmtClock(now, today[i][0]) };
      }
    }
    for (var k = 1; k <= 7; k++) {
      var idx = (todayIdx + k) % 7;
      var hs = HOURS[idx];
      if (hs && hs.length) {
        var future = new Date(now.getTime() + k * 86400000);
        var when = (k === 1) ? 'demain' : DAY_FR[idx];
        return { state: 'closed', label: 'Fermé · ouvre ' + when + ' à ' + fmtClock(future, hs[0][0]) };
      }
    }
    return { state: 'closed', label: 'Fermé' };
  }

  var status = null;
  try { status = computeStatus(); } catch (e) { status = null; }

  var chip = doc.getElementById('open-status');
  if (chip) {
    if (status) {
      chip.dataset.state = status.state;
      var txt = chip.querySelector('.txt');
      if (txt) txt.textContent = status.label;
      chip.hidden = false;
    } else if (chip.parentNode) {
      chip.parentNode.removeChild(chip);
    }
  }

  if (status) {
    var todayIdx2 = WD[zoneParts(new Date()).weekday];
    doc.querySelectorAll('.hours li[data-day]').forEach(function (li) {
      if (+li.getAttribute('data-day') === todayIdx2) {
        li.classList.add('today');
        var s = doc.createElement('span');
        s.className = 'day-status';
        s.textContent = status.label;
        li.appendChild(s);
      }
    });
    doc.querySelectorAll('.f-hours-list li[data-day]').forEach(function (li) {
      if (+li.getAttribute('data-day') === todayIdx2) li.classList.add('today');
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
    if (lb && lb.open) { return; }
    var src = img.currentSrc || img.src;
    if (!src) { return; }
    if (!canModal) { window.open(src, '_blank', 'noopener'); return; }
    if (!lb) { buildLb(); }
    lbImg.src = src;
    var w = img.getAttribute('width'), h = img.getAttribute('height');
    if (w && h) { lbImg.setAttribute('width', w); lbImg.setAttribute('height', h); }
    else { lbImg.removeAttribute('width'); lbImg.removeAttribute('height'); }
    lbImg.alt = '';
    var alt = img.getAttribute('alt') || '';
    lbCap.textContent = alt;
    lbCap.hidden = !alt;
    lastFocus = img;
    doc.documentElement.classList.add('lightbox-open');
    lb.showModal();
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
  doc.addEventListener('keydown', function (e) {
    var el = doc.activeElement;
    if (!el || !el.classList || !el.classList.contains('is-zoomable')) { return; }
    if (e.key === 'Enter') { e.preventDefault(); openLb(el); }
    else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); }
  });
  doc.addEventListener('keyup', function (e) {
    if (e.key !== ' ' && e.key !== 'Spacebar') { return; }
    var el = doc.activeElement;
    if (el && el.classList && el.classList.contains('is-zoomable')) { e.preventDefault(); openLb(el); }
  });
})();
