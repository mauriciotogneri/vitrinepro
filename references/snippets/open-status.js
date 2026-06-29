/* ── Open / closed status chip ──────────────────────────────────────────────
   Live "Ouvert / Fermé" pill for the hero trust strip, computed in Europe/Zurich.
   See references/site-conventions.md → "Open/closed status chip".

   Canonical & IDENTICAL across every site EXCEPT the HOURS map — copy this file
   verbatim into the end of js/main.js (a standalone IIFE, after the main one and
   before the lightbox IIFE) and fill in ONLY the HOURS block from the dossier.
   It declares its own `doc` and depends on nothing else in the file.

   French words are fixed by policy; only the HH:MM follows the visitor's locale
   (Intl with timeZone:'Europe/Zurich'), so the instant shown is always Geneva's.

   Markup it expects (the page renders this; the script only fills it in):
     • <span class="status-chip" id="open-status" hidden>…<span class="txt"></span></span>
       in the hero — revealed once a state is computed, or removed entirely if the
       browser has no Intl time-zone support (so the strip never shows a stale state).
     • optional <ul class="hours"> and/or <ul class="f-hours-list"> whose <li> carry
       data-day="0..6" (JS getDay: 0=Sun … 6=Sat): today's row gets .today, and the
       location list (.hours) also gets the live label appended as a .day-status span.

   HOURS format — minutes-of-day intervals per weekday, keyed by getDay()
   (0=Sun … 6=Sat). 07:30 = 450, 16:30 = 990. A closed day is []. Multiple
   intervals/day are allowed (e.g. a lunch split): [[480,720],[810,1080]].
   NOTE: each interval is assumed to lie within its own calendar day
   (open < close ≤ 1440). Venues open PAST MIDNIGHT are not handled — extend
   here (and flag it) if a dossier needs overnight hours.
   ──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var doc = document;

  /* ── EDIT: opening hours from the dossier ─────────────────────────────────
     Example below = Mon–Thu 07:30–16:30 · Fri 07:30–15:30 · Sat–Sun closed.   */
  var HOURS = {
    0: [],
    1: [[450, 990]],
    2: [[450, 990]],
    3: [[450, 990]],
    4: [[450, 990]],
    5: [[450, 930]],
    6: []
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
    /* zoneParts() carries no seconds, so the instant must be floored to its
       minute too — otherwise the dropped seconds skew the offset by up to a
       minute and the next-open time renders one minute late (07:30 → 07:31). */
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
