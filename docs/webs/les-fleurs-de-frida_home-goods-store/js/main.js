/* Les Fleurs de Frida — main interactions (vanilla, no deps) */
(function () {
  'use strict';
  var doc = document;

  /* ---- dynamic copyright year ---- */
  var yr = doc.getElementById('year');
  if (yr) { yr.textContent = new Date().getFullYear(); }

  /* ---- mobile nav toggle ---- */
  var toggle = doc.querySelector('.nav-toggle');
  var menu = doc.getElementById('nav-menu');
  if (toggle && menu) {
    var closeMenu = function () {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Ouvrir le menu');
      menu.classList.remove('is-open');
    };
    var openMenu = function () {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fermer le menu');
      menu.classList.add('is-open');
    };
    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); } else { openMenu(); }
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { closeMenu(); } });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); } });
    doc.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) { closeMenu(); }
    });
  }

  /* ---- scroll reveals (progressive: content stays visible without JS/observer) ---- */
  var reveals = [].slice.call(doc.querySelectorAll('.reveal'));
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reveals.length && 'IntersectionObserver' in window && !reduceMotion) {
    reveals.forEach(function (el) { el.classList.add('reveal-init'); });
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); revObs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revObs.observe(el); });
  }

  /* ---- scrollspy: mark the in-view section's nav link ---- */
  var links = [].slice.call(doc.querySelectorAll('.nav-menu a[href^="#"]'));
  var linkFor = {};
  var sections = [];
  links.forEach(function (l) {
    var id = l.getAttribute('href').slice(1);
    var s = doc.getElementById(id);
    if (s) { linkFor[id] = l; sections.push(s); }
  });
  if (sections.length && 'IntersectionObserver' in window) {
    var current = null;
    var spyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        var id = en.target.id;
        if (current && linkFor[current]) { linkFor[current].removeAttribute('aria-current'); }
        if (linkFor[id]) { linkFor[id].setAttribute('aria-current', 'true'); current = id; }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spyObs.observe(s); });
  }

  /* --- contact form: progressive enhancement over Formspree --- */
  var form = document.querySelector('.contact-form');
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
          setStatus('error', 'Une erreur est survenue. Réessayez, ou appelez-nous au +41 22 557 42 38.');
        }
      }).catch(function () {
        setStatus('error', 'Une erreur est survenue. Réessayez, ou appelez-nous au +41 22 557 42 38.');
      }).finally(function () {
        setBusy(false);
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
