/* Chez Marino — main behaviour: nav, scrollspy, reveals, tabs, form, year. */
(function () {
  'use strict';
  var doc = document;

  /* mobile nav */
  var toggle = doc.querySelector('.nav-toggle');
  var nav = doc.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.dataset.open = String(!open);
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        nav.dataset.open = 'false';
      });
    });
  }

  /* scrollspy — mark the in-view section's nav link */
  var navLinks = [].slice.call(doc.querySelectorAll('.nav a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = navLinks.find(function (a) { return a.getAttribute('href') === '#' + entry.target.id; });
          if (!link) { return; }
          if (entry.isIntersecting) {
            navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
            link.setAttribute('aria-current', 'page');
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* scroll reveals */
  var revealEls = [].slice.call(doc.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && revealEls.length) {
    var ro = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* menu tabs — tablist/tabpanel */
  var tablist = doc.querySelector('[role="tablist"]');
  if (tablist) {
    var tabs = [].slice.call(tablist.querySelectorAll('[role="tab"]'));
    var select = function (tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        var panel = doc.getElementById(t.getAttribute('aria-controls'));
        if (panel) { panel.dataset.active = String(selected); }
      });
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var idx = null;
        if (e.key === 'ArrowRight') { idx = (i + 1) % tabs.length; }
        else if (e.key === 'ArrowLeft') { idx = (i - 1 + tabs.length) % tabs.length; }
        else if (e.key === 'Home') { idx = 0; }
        else if (e.key === 'End') { idx = tabs.length - 1; }
        if (idx !== null) {
          e.preventDefault();
          tabs[idx].focus();
          select(tabs[idx]);
        }
      });
    });
  }

  /* footer year */
  var yearEl = doc.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }
})();

/* ── Open / closed status chip ──────────────────────────────────────────────
   Live "Ouvert / Fermé" pill for the hero trust strip, computed in Europe/Zurich.
   Canonical snippet (references/snippets/open-status.js) EXTENDED for Chez Marino:
   dinner service crosses midnight (18:30 -> 01:00/02:00), which the base snippet's
   model doesn't cover, so closing minutes go past 1440 (e.g. 01:00 = 1500) and a
   pre-check against YESTERDAY's overnight interval was added below (flagged in the
   build summary per site-conventions.md -> "Open/closed status chip"). ────────── */
(function () {
  'use strict';
  var doc = document;

  /* EDIT: opening hours from the dossier (official website — lunch every day
     11:30-14:30, dinner 18:30-01:00 Mon-Thu+Sun, 18:30-02:00 Fri-Sat). */
  var HOURS = {
    0: [[690, 870], [1110, 1500]], /* Sun */
    1: [[690, 870], [1110, 1500]], /* Mon */
    2: [[690, 870], [1110, 1500]], /* Tue */
    3: [[690, 870], [1110, 1500]], /* Wed */
    4: [[690, 870], [1110, 1500]], /* Thu */
    5: [[690, 870], [1110, 1560]], /* Fri */
    6: [[690, 870], [1110, 1560]]  /* Sat */
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
    if (todayIdx == null) { return null; }
    var mins = (+p.hour % 24) * 60 + (+p.minute);
    var i;

    /* yesterday's dinner service may cross midnight and still cover "now" */
    var yIdx = (todayIdx + 6) % 7;
    var yesterday = HOURS[yIdx] || [];
    for (i = 0; i < yesterday.length; i++) {
      var yc = yesterday[i][1];
      if (yc > 1440) {
        var cToday = yc - 1440;
        if (mins < cToday) {
          if (cToday - mins <= SOON_MIN) { return { state: 'soon', label: 'Ferme bientôt · ' + fmtClock(now, cToday) }; }
          return { state: 'open', label: 'Ouvert · ferme à ' + fmtClock(now, cToday) };
        }
      }
    }

    var today = HOURS[todayIdx] || [];
    for (i = 0; i < today.length; i++) {
      var o = today[i][0], c = today[i][1];
      if (mins >= o && mins < c) {
        if (c - mins <= SOON_MIN) { return { state: 'soon', label: 'Ferme bientôt · ' + fmtClock(now, c) }; }
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
      if (txt) { txt.textContent = status.label; }
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
      if (+li.getAttribute('data-day') === todayIdx2) { li.classList.add('today'); }
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
