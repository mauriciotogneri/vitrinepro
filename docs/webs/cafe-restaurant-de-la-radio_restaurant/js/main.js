/* ── Main behaviour: year, mobile nav, scrollspy ────────────────────────── */
(function () {
  'use strict';
  var doc = document;

  /* Footer year — never hardcoded */
  var yearEl = doc.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* Mobile nav toggle */
  var navToggle = doc.getElementById('navToggle');
  var siteNav = doc.getElementById('siteNav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    [].slice.call(siteNav.querySelectorAll('a')).forEach(function (a) {
      a.addEventListener('click', function () {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Ouvrir le menu');
      });
    });
  }

  /* Scrollspy — marks the in-view section's nav link with aria-current */
  var navLinks = [].slice.call(doc.querySelectorAll('.site-nav a[href^="#"]'));
  var spySections = navLinks
    .map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && spySections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = navLinks[spySections.indexOf(entry.target)];
        if (!link || !entry.isIntersecting) { return; }
        navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        link.setAttribute('aria-current', 'page');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spySections.forEach(function (s) { spy.observe(s); });
  }
})();

/* ── Open / closed status chip ──────────────────────────────────────────────
   Live "Ouvert / Fermé" pill for the hero trust strip, computed in Europe/Zurich.
   Canonical, copied from references/snippets/open-status.js, with ONE
   deliberate extension flagged below: Friday and Saturday dinner service
   crosses midnight (17:00–02:00), which the base snippet's HOURS format
   doesn't support (each interval assumed to close within its own calendar
   day). Extended with an "overnight carry-over" check — see the comment
   above computeStatus(). Everything else (French labels, Europe/Zurich
   computation, locale-formatted clock) is untouched.
   ──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var doc = document;

  /* ── EDIT: opening hours from the dossier (Google, user-confirmed official) ──
     Mon–Thu 10:45–15:15 & 17:00–24:00 · Fri 10:45–15:15 & 17:00–02:00(+1)
     Sat 10:00–15:00 & 17:00–02:00(+1) · Sun closed.
     Fri/Sat dinner service crosses midnight, so those closes are expressed
     as minutes >1440 (1560 = 26:00 = 02:00 the next day). fmtClock() already
     handles this correctly via Date.UTC's own hour-overflow normalisation —
     the only addition needed is the overnight carry-over check below.      */
  var HOURS = {
    0: [],
    1: [[645, 915], [1020, 1440]],
    2: [[645, 915], [1020, 1440]],
    3: [[645, 915], [1020, 1440]],
    4: [[645, 915], [1020, 1440]],
    5: [[645, 915], [1020, 1560]],
    6: [[600, 900], [1020, 1560]]
  };
  /* ─────────────────────────────────────────────────────────────────────────── */

  var DAY_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  var SOON_MIN = 30; /* minutes before close that flip the chip to "Ferme bientôt" */

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

    /* EXTENSION — overnight carry-over: yesterday's dinner service can still
       be running past midnight (a close >1440 = past 24:00, e.g. 1560 =
       02:00). Check this before today's own hours, since in the small hours
       "today" hasn't opened yet but yesterday's service may still be on. */
    var yest = HOURS[(todayIdx + 6) % 7] || [];
    for (i = 0; i < yest.length; i++) {
      var oc = yest[i][1];
      if (oc > 1440 && mins < oc - 1440) {
        var c2 = oc - 1440;
        if (c2 - mins <= SOON_MIN) return { state: 'soon', label: 'Ferme bientôt · ' + fmtClock(now, c2) };
        return { state: 'open', label: 'Ouvert · ferme à ' + fmtClock(now, c2) };
      }
    }

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
      chip.parentNode.removeChild(chip); /* no tz support → don't mislead */
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

/* ---- contact form: progressive enhancement over Formspree ---- */
(function () {
  'use strict';
  var form = document.querySelector('.contact-form');
  if (!form) { return; }
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
        setStatus('error', 'Une erreur est survenue. Réessayez, ou appelez-nous au 022 321 64 17.');
      }
    }).catch(function () {
      setStatus('error', 'Une erreur est survenue. Réessayez, ou appelez-nous au 022 321 64 17.');
    }).finally(function () {
      setBusy(false);
    });
  });
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
