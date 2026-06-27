/* Empanadas Republic — shared behaviour. Vanilla, no framework, no inline handlers. */
(function () {
  'use strict';
  var doc = document;

  /* --- dynamic copyright year (never hardcoded) --- */
  doc.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* --- header shadow on scroll --- */
  var header = doc.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.dataset.scrolled = String(window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- mobile nav toggle --- */
  var toggle = doc.querySelector('.nav-toggle');
  var nav = doc.getElementById('primary-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      nav.dataset.open = String(open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { setOpen(false); }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* --- current time in Europe/Zurich --- */
  var zurich = null;
  try {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Zurich', weekday: 'short',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    var v = {};
    parts.forEach(function (x) { v[x.type] = x.value; });
    var dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    zurich = { day: dayMap[v.weekday], mins: ((+v.hour) % 24) * 60 + (+v.minute) };
  } catch (e) { zurich = null; }

  /* --- open / closed badge — Mon–Fri 11:00–19:00, Sat–Sun 11:00–15:00 --- */
  function openNow() {
    if (!zurich) { return null; }
    var weekend = zurich.day === 0 || zurich.day === 6;
    var close = weekend ? 15 * 60 : 19 * 60;
    return zurich.mins >= 11 * 60 && zurich.mins < close;
  }
  var open = openNow();
  doc.querySelectorAll('[data-open-badge]').forEach(function (b) {
    if (open === null) { return; }            /* no tz support → leave hidden, don't mislead */
    b.hidden = false;
    b.dataset.state = open ? 'open' : 'closed';
    var label = b.querySelector('.label');
    if (label) { label.textContent = open ? 'Ouvert' : 'Fermé'; }
  });

  /* --- highlight today's row in the hours table --- */
  if (zurich) {
    doc.querySelectorAll('.hours-table tr[data-day]').forEach(function (tr) {
      if (tr.getAttribute('data-day').split(' ').indexOf(String(zurich.day)) !== -1) {
        tr.classList.add('is-today');
      }
    });
  }

  /* --- scroll reveal --- */
  var reveals = [].slice.call(doc.querySelectorAll('.reveal'));
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* --- scroll-spy: aria-current on in-page nav links --- */
  var spyLinks = [].slice.call(doc.querySelectorAll('.nav-links a[href^="#"]:not(.btn)'));
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
          if (byId[en.target.id]) { byId[en.target.id].setAttribute('aria-current', 'page'); }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* --- contact form: progressive enhancement over Formspree --- */
  var form = doc.querySelector('.contact-form');
  if (form) {
    var status = form.querySelector('[data-form-status]');
    var setStatus = function (state, msg) {
      if (!status) { return; }
      status.dataset.state = state;
      status.textContent = msg;
    };
    form.addEventListener('submit', function (e) {
      if (form.action.indexOf('{{') !== -1) {       /* placeholder ID not yet replaced */
        e.preventDefault();
        setStatus('error', 'Formulaire bientôt actif — configuration en cours. Écrivez-nous sur Instagram en attendant.');
        return;
      }
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var orig = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }
      setStatus('', '');
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (r) {
        if (r.ok) {
          form.reset();
          setStatus('ok', 'Merci ! Votre message est bien parti — on vous répond vite.');
        } else {
          return r.json().then(function (d) {
            throw new Error((d && d.errors && d.errors[0] && d.errors[0].message) || 'error');
          });
        }
      }).catch(function () {
        setStatus('error', "Oups — l'envoi a échoué. Réessayez, ou écrivez-nous sur Instagram.");
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = orig; }
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
