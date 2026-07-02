/* Boulangerie Dubois — shared behaviour. Vanilla, no framework, no inline handlers. */
(function () {
  'use strict';
  var doc = document;

  /* --- dynamic copyright year (never hardcoded) --- */
  doc.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* --- mobile nav toggle --- */
  var toggle = doc.getElementById('nav-toggle');
  var menu = doc.getElementById('nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a') && toggle.getAttribute('aria-expanded') === 'true') {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
        toggle.focus();
      }
    });
  }

  /* --- weekday + time in Europe/Zurich --- */
  var zurichNow = null;
  try {
    var p = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Zurich', weekday: 'short',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    var m = {};
    p.forEach(function (x) { m[x.type] = x.value; });
    zurichNow = { day: m.weekday, mins: (+m.hour) * 60 + (+m.minute) };
  } catch (e) { zurichNow = null; }

  /* --- open / closed badge — Mon–Sat 07:00–18:00, Sun 08:00–17:00 --- */
  var badge = doc.getElementById('open-status');
  if (badge) {
    if (zurichNow) {
      var openNow = (zurichNow.day === 'Sun')
        ? (zurichNow.mins >= 480 && zurichNow.mins < 1020)
        : (zurichNow.mins >= 420 && zurichNow.mins < 1080);
      badge.dataset.state = openNow ? 'open' : 'closed';
      var txt = badge.querySelector('.txt');
      if (txt) txt.textContent = openNow ? (badge.dataset.open || 'Ouvert') : (badge.dataset.closed || 'Fermé');
    } else {
      badge.parentNode && badge.parentNode.removeChild(badge); /* no tz support → don't mislead */
    }
  }

  /* --- highlight today's row in the hours table --- */
  if (zurichNow) {
    doc.querySelectorAll('.hours tr[data-days]').forEach(function (tr) {
      if (tr.getAttribute('data-days').split(',').indexOf(zurichNow.day) !== -1) {
        tr.classList.add('today');
      }
    });
  }

  /* --- scroll reveal --- */
  var reveals = [].slice.call(doc.querySelectorAll('.reveal'));
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* --- scroll-spy: aria-current on in-page nav links --- */
  var spyLinks = [].slice.call(doc.querySelectorAll('.nav-list a[href^="#"]'));
  if ('IntersectionObserver' in window && spyLinks.length) {
    var byId = {};
    spyLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sections = Object.keys(byId)
      .map(function (id) { return doc.getElementById(id); })
      .filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          spyLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
          if (byId[en.target.id]) byId[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
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
        setStatus('error', 'Une erreur est survenue. Réessayez, ou appelez-nous au +41 22 328 01 24.');
      }
    }).catch(function () {
      setStatus('error', 'Une erreur est survenue. Réessayez, ou appelez-nous au +41 22 328 01 24.');
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
