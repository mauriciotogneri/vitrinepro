/* Jean-Robert Gase — chapelier · modiste. Vanilla JS, no framework. */
(function () {
  "use strict";

  /* ---- dynamic copyright year ---- */
  var y = document.getElementById("year");
  if (y) { y.textContent = String(new Date().getFullYear()); }

  /* ---- mobile nav toggle ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      links.classList.toggle("open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) { setOpen(false); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { setOpen(false); }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav") && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
      }
    });
  }

  /* ---- scroll reveals ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- scrollspy: mark the active section in the nav ---- */
  var navAnchors = Array.prototype.slice.call(
    document.querySelectorAll('#nav-links a[href^="#"]')
  );
  var sections = navAnchors
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        var id = en.target.id;
        navAnchors.forEach(function (a) {
          if (a.getAttribute("href") === "#" + id) {
            a.setAttribute("aria-current", "true");
          } else {
            a.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- progressive contact-form enhancement (Formspree) ---- */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  if (form && status && window.fetch) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      // let the native POST happen if the endpoint isn't configured yet
      if (action.indexOf("{{") !== -1) { return; }
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      status.removeAttribute("data-state");
      status.textContent = form.getAttribute("data-sending") || "Sending…";
      if (btn) { btn.disabled = true; }
      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (r) {
        if (r.ok) {
          form.reset();
          status.setAttribute("data-state", "ok");
          status.textContent = form.getAttribute("data-ok") || "Thank you — message sent.";
        } else {
          throw new Error("bad status");
        }
      }).catch(function () {
        status.setAttribute("data-state", "err");
        status.textContent = form.getAttribute("data-err") || "Something went wrong. Please call or email instead.";
      }).then(function () {
        if (btn) { btn.disabled = false; }
      });
    });
  }
})();
