/* Toutou-Club — shared vanilla JS. No framework, no inline handlers. */
(function () {
  "use strict";

  var lang = (document.documentElement.lang || "fr").slice(0, 2).toLowerCase();
  var fr = lang === "fr";

  /* ---- Dynamic copyright year (never hardcoded) --------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---- Sticky header shadow ----------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile navigation -------------------------------------------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    var mq = window.matchMedia("(min-width: 861px)");
    var syncMq = function () { if (mq.matches) { setOpen(false); } };
    (mq.addEventListener ? mq.addEventListener("change", syncMq) : mq.addListener(syncMq));
  }

  /* ---- Open / closed badge (Europe/Zurich, by weekday) -------------- */
  /* Hours are appointment-only Mon–Fri; weekends closed. We surface the
     known fact (open days) without inventing precise opening/closing times. */
  try {
    var statusEls = document.querySelectorAll("[data-status]");
    if (statusEls.length) {
      var weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Zurich", weekday: "short"
      }).format(new Date());
      var openToday = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(weekday) !== -1;
      var label = openToday
        ? (fr ? "Ouvert aujourd’hui · sur rendez-vous" : "Open today · by appointment")
        : (fr ? "Fermé aujourd’hui" : "Closed today");
      statusEls.forEach(function (el) {
        el.classList.toggle("is-open", openToday);
        var txt = el.querySelector("[data-status-text]");
        if (txt) { txt.textContent = label; }
      });
    }
  } catch (e) { /* Intl unavailable — leave neutral static label */ }

  /* ---- Scroll reveals (IntersectionObserver + fallback) ------------- */
  var reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) { return; }
  if (!("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  reveals.forEach(function (el) { io.observe(el); });
})();
