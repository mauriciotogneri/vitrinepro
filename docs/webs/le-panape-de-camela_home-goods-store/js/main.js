/* Le Panapé de Caméla — shared vanilla JS (no framework).
   Progressive enhancement: the page is fully usable without this file. */
(function () {
  "use strict";

  var docEl = document.documentElement;
  var supportsIO = "IntersectionObserver" in window;
  docEl.classList.add("js");

  /* ---- 1. Dynamic copyright year (never hardcoded) ---- */
  var year = String(new Date().getFullYear());
  var slots = document.querySelectorAll("[data-year]");
  for (var i = 0; i < slots.length; i++) slots[i].textContent = year;

  /* ---- 2. Scroll-reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (!supportsIO) {
    for (var r = 0; r < reveals.length; r++) reveals[r].classList.add("is-visible");
  } else if (reveals.length) {
    var revObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    for (var k = 0; k < reveals.length; k++) revObserver.observe(reveals[k]);
  }

  /* ---- 3. Mobile navigation ---- */
  var nav = document.querySelector(".nav");
  var toggle = nav && nav.querySelector(".nav-toggle");
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    var links = nav.querySelectorAll(".nav-links a");
    for (var n = 0; n < links.length; n++) {
      links[n].addEventListener("click", function () { setOpen(false); });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920 && nav.classList.contains("is-open")) setOpen(false);
    });
  }

  /* ---- 4. Scroll-spy: mark the in-view section's nav link ---- */
  var navAnchors = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );
  if (supportsIO && navAnchors.length) {
    var linkFor = function (id) {
      for (var a = 0; a < navAnchors.length; a++) {
        if (navAnchors[a].getAttribute("href") === "#" + id) return navAnchors[a];
      }
      return null;
    };
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var active = linkFor(entry.target.id);
          if (!active) return;
          for (var a = 0; a < navAnchors.length; a++) navAnchors[a].removeAttribute("aria-current");
          active.setAttribute("aria-current", "page");
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    var sections = document.querySelectorAll("main section[id]");
    for (var s = 0; s < sections.length; s++) spy.observe(sections[s]);
  }

  /* ---- 5. Open / closed badge (Europe/Zurich) ---- */
  /* minutes-from-midnight ranges, keyed by weekday (0=Sun … 6=Sat) */
  var SCHEDULE = {
    0: [],                 // Sunday — closed
    1: [[840, 1110]],      // Monday 14:00–18:30
    2: [[630, 1110]],      // Tue 10:30–18:30
    3: [[630, 1110]],
    4: [[630, 1110]],
    5: [[630, 1110]],
    6: [[630, 1080]]       // Sat 10:30–18:00
  };
  var WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  var badge = document.querySelector(".open-badge");
  try {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Zurich",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date());

    var wd = null, hh = 0, mm = 0;
    parts.forEach(function (p) {
      if (p.type === "weekday") wd = WEEKDAY_INDEX[p.value];
      else if (p.type === "hour") hh = parseInt(p.value, 10);
      else if (p.type === "minute") mm = parseInt(p.value, 10);
    });
    if (hh === 24) hh = 0;

    if (wd !== null) {
      var now = hh * 60 + mm;
      var ranges = SCHEDULE[wd] || [];
      var isOpen = ranges.some(function (rg) { return now >= rg[0] && now < rg[1]; });

      if (badge) {
        var labelOpen = badge.getAttribute("data-open") || "Open";
        var labelClosed = badge.getAttribute("data-closed") || "Closed";
        var labelSpan = badge.querySelector(".open-label");
        badge.setAttribute("data-state", isOpen ? "open" : "closed");
        if (labelSpan) labelSpan.textContent = isOpen ? labelOpen : labelClosed;
        badge.hidden = false;
      }

      var today = document.querySelector('.hours-list li[data-day="' + wd + '"]');
      if (today) today.classList.add("is-today");
    }
  } catch (err) {
    if (badge) badge.hidden = true; /* Intl unsupported — hide rather than mislead */
  }
})();
