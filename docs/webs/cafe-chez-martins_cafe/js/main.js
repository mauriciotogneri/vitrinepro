/* Café Chez Martins — shared behaviour. Vanilla, no dependencies. */
(function () {
  "use strict";

  var doc = document;
  var lang = (doc.documentElement.lang || "fr").toLowerCase().indexOf("en") === 0 ? "en" : "fr";

  /* ---- Dynamic copyright year (never hard-coded in markup) ---- */
  var year = new Date().getFullYear();
  doc.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = year; });

  /* ---- Mobile navigation ---- */
  var toggle = doc.querySelector("[data-nav-toggle]");
  var menu = doc.querySelector("[data-nav-menu]");
  if (toggle && menu) {
    var setOpen = function (open) {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
      if (open) { var first = menu.querySelector("a"); if (first) first.focus(); }
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false); toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 880) setOpen(false);
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = doc.querySelectorAll(".reveal");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); obs.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    revealEls.forEach(function (el) { revObs.observe(el); });
  }

  /* ---- Scroll-spy: aria-current on nav links ---- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll(".nav-links a[href^='#']"));
  if (navLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    navLinks.forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });
    var sections = navLinks
      .map(function (a) { return doc.getElementById(a.getAttribute("href").slice(1)); })
      .filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
          var active = linkFor[entry.target.id];
          if (active) active.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Open / closed badge (Europe/Zurich) ---- */
  var badge = doc.querySelector("[data-open-badge]");
  // Hours per Google / OpenStreetMap (canonical). Minutes from midnight.
  var schedule = {
    Mon: null,
    Tue: [360, 960], Wed: [360, 960], Thu: [360, 960], Fri: [360, 960],
    Sat: [420, 960], Sun: [480, 960]
  };
  var order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function zurichNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Zurich", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date());
      var p = {};
      parts.forEach(function (x) { p[x.type] = x.value; });
      var wd = p.weekday.slice(0, 3);
      var h = parseInt(p.hour, 10); if (h === 24) h = 0;
      return { wd: wd, mins: h * 60 + parseInt(p.minute, 10) };
    } catch (e) { return null; }
  }

  function fmtTime(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    if (lang === "fr") return m ? (h + "h" + (m < 10 ? "0" + m : m)) : (h + "h");
    return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
  }

  // Mark today's row in any hours table.
  var now = zurichNow();
  if (now) {
    var row = doc.querySelector(".hours-table tr[data-day='" + now.wd + "']");
    if (row) row.classList.add("is-today");
  }

  if (badge && now) {
    var todayHrs = schedule[now.wd];
    var open = !!todayHrs && now.mins >= todayHrs[0] && now.mins < todayHrs[1];
    var label, dotOnly = badge.querySelector(".dot");
    var text = doc.createElement("span");
    if (open) {
      badge.classList.add("is-open");
      label = lang === "fr" ? "Ouvert · ferme à " + fmtTime(todayHrs[1])
                            : "Open · closes " + fmtTime(todayHrs[1]);
    } else if (todayHrs && now.mins < todayHrs[0]) {
      label = lang === "fr" ? "Fermé · ouvre à " + fmtTime(todayHrs[0])
                            : "Closed · opens " + fmtTime(todayHrs[0]);
    } else {
      // find next open day
      var next = null;
      for (var i = 1; i <= 7; i++) {
        var idx = (order.indexOf(now.wd) + i) % 7;
        var d = order[idx];
        if (schedule[d]) { next = d; break; }
      }
      var dayName = { fr: { Mon: "lundi", Tue: "mardi", Wed: "mercredi", Thu: "jeudi", Fri: "vendredi", Sat: "samedi", Sun: "dimanche" },
                      en: { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" } }[lang];
      label = lang === "fr" ? "Fermé" + (next ? " · réouvre " + dayName[next] : "")
                            : "Closed" + (next ? " · reopens " + dayName[next] : "");
    }
    text.textContent = label;
    badge.appendChild(text);
    badge.hidden = false;
  }
})();
