/* Miro Barber Shop — header state, reveals, open/closed badge */
(function () {
  "use strict";

  /* Dynamic copyright year */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* Header: solid background after scrolling past the hero top */
  var head = document.querySelector(".site-head");
  if (head) {
    var onScroll = function () {
      head.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Scroll reveals */
  var revealed = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    revealed.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealed.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* Open/closed badge — shop hours: Mon–Sat 09:00–19:00, Europe/Zurich */
  var badge = document.querySelector("[data-open-badge]");
  if (badge) {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Zurich",
        weekday: "short",
        hour: "numeric",
        hourCycle: "h23",
      }).formatToParts(new Date());
      var get = function (type) {
        var p = parts.find(function (x) {
          return x.type === type;
        });
        return p ? p.value : "";
      };
      var day = get("weekday");
      var hour = parseInt(get("hour"), 10);
      var isOpen = day !== "Sun" && hour >= 9 && hour < 19;
      badge.textContent = isOpen
        ? badge.getAttribute("data-open-text")
        : badge.getAttribute("data-closed-text");
      badge.classList.add(isOpen ? "open" : "closed");
    } catch (e) {
      /* Intl unavailable: keep the static hours text */
    }
  }
})();
