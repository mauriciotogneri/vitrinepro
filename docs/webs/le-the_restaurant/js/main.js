/* Le Thé — shared behaviour. Vanilla, no framework, no inline handlers. */
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

  /* --- weekday helpers in Europe/Zurich --- */
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

  /* --- open / closed badge — Mon–Sat 12:00–22:00, Sun closed --- */
  var badge = doc.getElementById('open-status');
  if (badge) {
    if (zurichNow) {
      var openNow = zurichNow.day !== 'Sun' && zurichNow.mins >= 720 && zurichNow.mins < 1320;
      badge.dataset.state = openNow ? 'open' : 'closed';
      var txt = badge.querySelector('.txt');
      if (txt) txt.textContent = openNow ? (badge.dataset.open || 'Open') : (badge.dataset.closed || 'Closed');
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
