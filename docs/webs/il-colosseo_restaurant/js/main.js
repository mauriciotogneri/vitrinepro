/* Il Colosseo — vanilla JS, no framework. End-of-body, IIFE, no inline handlers. */
(function () {
  'use strict';
  var doc = document;

  /* ---- Dynamic copyright year (never hard-coded in markup) ---- */
  var yearEl = doc.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Mobile navigation toggle ---- */
  var header = doc.querySelector('.site-header');
  var toggle = doc.querySelector('.nav-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    Array.prototype.forEach.call(header.querySelectorAll('.nav-links a'), function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Scroll-reveal (IntersectionObserver, with no-IO fallback) ---- */
  var reveals = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('in'); });
  }

  /* ---- Opening hours: open/closed badge + today highlight (Europe/Zurich) ---- */
  /* Schedule keyed by weekday (0 = Sunday … 6 = Saturday), times in minutes from midnight. */
  var schedule = {
    1: [[690, 870], [1080, 1350]],   /* Mon  11:30–14:30, 18:00–22:30 */
    2: [[690, 870], [1110, 1350]],   /* Tue  11:30–14:30, 18:30–22:30 */
    3: [[690, 870], [1110, 1350]],
    4: [[690, 870], [1110, 1350]],
    5: [[690, 870], [1110, 1350]],
    6: [[690, 870], [1110, 1350]],
    0: []                            /* Sun  closed */
  };
  var isFr = (doc.documentElement.lang || 'en').toLowerCase().indexOf('fr') === 0;
  var labels = isFr ? { open: 'Ouvert', closed: 'Fermé' } : { open: 'Open', closed: 'Closed' };

  function zurichNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Zurich', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var wdays = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var day = wdays[map.weekday];
      if (day === undefined) return null;
      return { day: day, mins: (parseInt(map.hour, 10) % 24) * 60 + parseInt(map.minute, 10) };
    } catch (err) {
      return null;
    }
  }

  var now = zurichNow();
  if (now) {
    var isOpen = (schedule[now.day] || []).some(function (iv) {
      return now.mins >= iv[0] && now.mins < iv[1];
    });
    var badge = doc.querySelector('[data-open-badge]');
    if (badge) {
      badge.hidden = false;
      badge.setAttribute('data-state', isOpen ? 'open' : 'closed');
      badge.textContent = '';
      var dot = doc.createElement('span');
      dot.className = 'dot';
      badge.appendChild(dot);
      badge.appendChild(doc.createTextNode(isOpen ? labels.open : labels.closed));
    }
    var todayLi = doc.querySelector('.hours li[data-day="' + now.day + '"]');
    if (todayLi) todayLi.classList.add('is-today');
  }
})();
