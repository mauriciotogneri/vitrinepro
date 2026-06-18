/* =========================================================
   INTERACTIONS (vanilla JS — works with or without Bootstrap JS)
   ========================================================= */
(function () {
  "use strict";

  /* ---- Footer year ---- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---- Mobile nav ---- */
  var toggle = document.getElementById("navToggle");
  var links  = document.getElementById("navLinks");
  function closeNav() { links.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });

  /* ---- Sticky nav shadow ---- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
    document.getElementById("toTop").classList.toggle("is-show", window.scrollY > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Back to top ---- */
  document.getElementById("toTop").addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---- Seamless marquee (duplicate the track content) ---- */
  var track = document.getElementById("marqueeTrack");
  if (track && track.children.length === 1) {
    track.appendChild(track.children[0].cloneNode(true));
  }

  /* ---- Menu tabs ---- */
  var tabs  = document.querySelectorAll(".menu-tab");
  var panes = document.querySelectorAll(".menu-pane");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      panes.forEach(function (p) { p.classList.remove("is-active"); });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      var pane = document.getElementById("pane-" + tab.dataset.pane);
      if (pane) pane.classList.add("is-active");
    });
  });

  /* ---- Gallery lightbox ---- */
  var lb       = document.getElementById("lightbox");
  var lbImg    = document.getElementById("lightboxImg");
  var lbClose  = document.getElementById("lightboxClose");
  function openLightbox(url) {
    /* layer the photo over a warm gradient so a missing image still looks intentional */
    lbImg.style.backgroundImage = "url('" + url + "'), linear-gradient(150deg,#C98A4A,#43301F)";
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
  }
  function closeLightbox() { lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true"); }
  document.querySelectorAll(".tile").forEach(function (tile) {
    tile.addEventListener("click", function () {
      if (tile.dataset.full) openLightbox(tile.dataset.full);
    });
  });
  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });

  /* ---- Scroll reveal ---- */
  var reveal = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    reveal.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveal.forEach(function (el) { io.observe(el); });
  }
})();
