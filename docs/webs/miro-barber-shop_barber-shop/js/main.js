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

  /* contact form — progressive enhancement over Formspree */
  var fr = (document.documentElement.lang || "fr").toLowerCase().indexOf("fr") === 0;
  var form = document.querySelector("#contact form");
  if (form) {
    var status = form.querySelector(".form-status");
    var statusText = status ? status.querySelector(".form-status-text") : null;
    var submitBtn = form.querySelector('button[type="submit"]');
    var fields = [].slice.call(form.querySelectorAll("input, textarea"));

    var setStatus = function (state, msg) {
      if (!status || !statusText) { return; }
      status.dataset.state = state;
      statusText.textContent = msg;
    };
    var setBusy = function (busy) {
      if (submitBtn) {
        submitBtn.disabled = busy;
        submitBtn.setAttribute("aria-busy", String(busy));
      }
      fields.forEach(function (f) { f.disabled = busy; });
    };
    var MSG = fr ? {
      ok: "Merci, votre message a bien été envoyé ! Nous vous répondrons rapidement.",
      err: "Une erreur est survenue. Réessayez, ou appelez-nous au 076 407 50 52."
    } : {
      ok: "Thank you, your message has been sent! We'll get back to you shortly.",
      err: "Something went wrong. Please try again, or call us on 076 407 50 52."
    };

    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) { return; }
      e.preventDefault();
      var data = new FormData(form); /* capture before disabling — disabled fields are excluded from FormData */
      setStatus("", "");
      setBusy(true);
      fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      }).then(function (r) {
        if (r.ok) {
          form.reset();
          setStatus("ok", MSG.ok);
        } else {
          setStatus("error", MSG.err);
        }
      }).catch(function () {
        setStatus("error", MSG.err);
      }).finally(function () {
        setBusy(false);
      });
    });
  }
})();
