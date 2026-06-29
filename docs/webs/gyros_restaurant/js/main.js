/* =============================================================================
   GYROS — main.js  (vanilla, end-of-body, no inline handlers)
   ========================================================================== */
(function () {
  "use strict";
  var doc = document;

  /* — dynamic copyright year — */
  var yearEl = doc.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* — mobile nav toggle — */
  var nav = doc.getElementById("nav");
  var toggle = doc.getElementById("nav-toggle");
  var links = doc.getElementById("nav-links");
  if (nav && toggle && links) {
    var setOpen = function (open) {
      links.classList.toggle("open", open);
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        setOpen(false);
      }
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* — scrollspy: mark the in-view section's nav link with aria-current — */
  var navAnchors = [].slice.call(doc.querySelectorAll(".nav-links a[href^='#']"));
  var sections = navAnchors
    .map(function (a) {
      return doc.getElementById(a.getAttribute("href").slice(1));
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var setCurrent = function (id) {
      navAnchors.forEach(function (a) {
        if (a.getAttribute("href") === "#" + id) {
          a.setAttribute("aria-current", "true");
        } else {
          a.removeAttribute("aria-current");
        }
      });
    };
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            setCurrent(en.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* — scroll reveal — */
  var reveals = [].slice.call(doc.querySelectorAll(".reveal"));
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      var ro = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("in");
              obs.unobserve(en.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
      );
      reveals.forEach(function (el) {
        ro.observe(el);
      });
    } else {
      reveals.forEach(function (el) {
        el.classList.add("in");
      });
    }
  }

  /* — carte tabs (ARIA tablist) — */
  var tablist = doc.querySelector('.tabs[role="tablist"]');
  if (tablist) {
    var tabs = [].slice.call(tablist.querySelectorAll('[role="tab"]'));
    var selectTab = function (tab, focus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", selected ? "true" : "false");
        t.tabIndex = selected ? 0 : -1;
        var panel = doc.getElementById(t.getAttribute("aria-controls"));
        if (panel) {
          panel.hidden = !selected;
        }
      });
      if (focus) {
        tab.focus();
      }
    };
    tablist.addEventListener("click", function (e) {
      var tab = e.target.closest('[role="tab"]');
      if (tab) {
        selectTab(tab, false);
      }
    });
    tablist.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(doc.activeElement);
      if (i < 0) {
        return;
      }
      var next = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = (i + 1) % tabs.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = (i - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        next = 0;
      } else if (e.key === "End") {
        next = tabs.length - 1;
      }
      if (next > -1) {
        e.preventDefault();
        selectTab(tabs[next], true);
      }
    });
  }
})();

/* ── Open / closed status chip ──────────────────────────────────────────────
   Live "Ouvert / Fermé" pill, computed in Europe/Zurich. Canonical IIFE — only
   the HOURS map below is per-site (see references/snippets/open-status.js). */
(function () {
  "use strict";
  var doc = document;

  /* GYROS — Lun–Ven 11h30–14h & 18h30–22h · Sam fermé · Dim 18h30–22h */
  var HOURS = {
    0: [[1110, 1320]],
    1: [[690, 840], [1110, 1320]],
    2: [[690, 840], [1110, 1320]],
    3: [[690, 840], [1110, 1320]],
    4: [[690, 840], [1110, 1320]],
    5: [[690, 840], [1110, 1320]],
    6: []
  };

  var DAY_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  var SOON_MIN = 30;

  function zoneParts(date) {
    var o = {};
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Zurich", weekday: "short",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(date).forEach(function (p) { o[p.type] = p.value; });
    return o;
  }
  function zoneOffsetMin(date) {
    var p = zoneParts(date);
    var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
    var dateMin = Math.floor(date.getTime() / 60000) * 60000;
    return Math.round((asUTC - dateMin) / 60000);
  }
  function fmtClock(refDate, minutesOfDay) {
    var p = zoneParts(refDate);
    var off = zoneOffsetMin(refDate);
    var utcMs = Date.UTC(+p.year, +p.month - 1, +p.day,
      Math.floor(minutesOfDay / 60), minutesOfDay % 60) - off * 60000;
    return new Intl.DateTimeFormat(navigator.language || "fr-CH", {
      hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich"
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
        if (c - mins <= SOON_MIN) return { state: "soon", label: "Ferme bientôt · " + fmtClock(now, c) };
        return { state: "open", label: "Ouvert · ferme à " + fmtClock(now, c) };
      }
    }
    for (i = 0; i < today.length; i++) {
      if (today[i][0] > mins) {
        return { state: "closed", label: "Fermé · ouvre à " + fmtClock(now, today[i][0]) };
      }
    }
    for (var k = 1; k <= 7; k++) {
      var idx = (todayIdx + k) % 7;
      var hs = HOURS[idx];
      if (hs && hs.length) {
        var future = new Date(now.getTime() + k * 86400000);
        var when = (k === 1) ? "demain" : DAY_FR[idx];
        return { state: "closed", label: "Fermé · ouvre " + when + " à " + fmtClock(future, hs[0][0]) };
      }
    }
    return { state: "closed", label: "Fermé" };
  }

  var status = null;
  try { status = computeStatus(); } catch (e) { status = null; }

  var chip = doc.getElementById("open-status");
  if (chip) {
    if (status) {
      chip.dataset.state = status.state;
      var txt = chip.querySelector(".txt");
      if (txt) txt.textContent = status.label;
      chip.hidden = false;
    } else if (chip.parentNode) {
      chip.parentNode.removeChild(chip);
    }
  }

  if (status) {
    var todayIdx2 = WD[zoneParts(new Date()).weekday];
    doc.querySelectorAll(".hours li[data-day]").forEach(function (li) {
      if (+li.getAttribute("data-day") === todayIdx2) {
        li.classList.add("today");
        var s = doc.createElement("span");
        s.className = "day-status";
        s.textContent = status.label;
        li.appendChild(s);
      }
    });
    doc.querySelectorAll(".f-hours-list li[data-day]").forEach(function (li) {
      if (+li.getAttribute("data-day") === todayIdx2) li.classList.add("today");
    });
  }
})();

/* ---- photo lightbox: click / Enter / Space to enlarge any content image ----
   Self-contained and identical across every site. Hooks every <picture> img. */
(function () {
  "use strict";
  var doc = document;
  var zoomables = [].slice.call(doc.querySelectorAll("picture img"));
  if (!zoomables.length) { return; }

  var fr = (doc.documentElement.lang || "fr").toLowerCase().indexOf("fr") === 0;
  var T = fr
    ? { zoom: "Agrandir : ", enlarge: "Agrandir l’image", close: "Fermer", title: "Image agrandie" }
    : { zoom: "Enlarge: ", enlarge: "Enlarge image", close: "Close", title: "Enlarged image" };

  var canModal = typeof HTMLDialogElement === "function" &&
    typeof HTMLDialogElement.prototype.showModal === "function";

  var lb = null, lbImg = null, lbCap = null, lastFocus = null;

  var closeLb = function () { if (lb && lb.open) { lb.close(); } };

  var buildLb = function () {
    lb = doc.createElement("dialog");
    lb.className = "lightbox";
    lb.setAttribute("aria-label", T.title);

    var btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "lightbox__close";
    btn.setAttribute("aria-label", T.close);
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M6 6l12 12M18 6L6 18"/></svg>';

    var fig = doc.createElement("figure");
    fig.className = "lightbox__fig";
    lbImg = doc.createElement("img");
    lbImg.className = "lightbox__img";
    lbImg.decoding = "async";
    lbImg.alt = "";
    lbCap = doc.createElement("figcaption");
    lbCap.className = "lightbox__cap";
    fig.appendChild(lbImg);
    fig.appendChild(lbCap);

    lb.appendChild(btn);
    lb.appendChild(fig);
    doc.body.appendChild(lb);

    btn.addEventListener("click", closeLb);
    lb.addEventListener("click", function (e) { if (e.target === lb) { closeLb(); } });
    lb.addEventListener("close", function () {
      doc.documentElement.classList.remove("lightbox-open");
      if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
    });
  };

  var openLb = function (img) {
    if (lb && lb.open) { return; }
    var src = img.currentSrc || img.src;
    if (!src) { return; }
    if (!canModal) { window.open(src, "_blank", "noopener"); return; }
    if (!lb) { buildLb(); }
    lbImg.src = src;
    var w = img.getAttribute("width"), h = img.getAttribute("height");
    if (w && h) { lbImg.setAttribute("width", w); lbImg.setAttribute("height", h); }
    else { lbImg.removeAttribute("width"); lbImg.removeAttribute("height"); }
    lbImg.alt = "";
    var alt = img.getAttribute("alt") || "";
    lbCap.textContent = alt;
    lbCap.hidden = !alt;
    lastFocus = img;
    doc.documentElement.classList.add("lightbox-open");
    lb.showModal();
  };

  zoomables.forEach(function (img) {
    img.classList.add("is-zoomable");
    img.setAttribute("role", "button");
    img.setAttribute("tabindex", "0");
    img.setAttribute("aria-haspopup", "dialog");
    var alt = img.getAttribute("alt") || "";
    img.setAttribute("aria-label", alt ? (T.zoom + alt) : T.enlarge);
  });

  doc.addEventListener("click", function (e) {
    var img = e.target.closest ? e.target.closest("img.is-zoomable") : null;
    if (img) { e.preventDefault(); openLb(img); }
  });
  doc.addEventListener("keydown", function (e) {
    var el = doc.activeElement;
    if (!el || !el.classList || !el.classList.contains("is-zoomable")) { return; }
    if (e.key === "Enter") { e.preventDefault(); openLb(el); }
    else if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); }
  });
  doc.addEventListener("keyup", function (e) {
    if (e.key !== " " && e.key !== "Spacebar") { return; }
    var el = doc.activeElement;
    if (el && el.classList && el.classList.contains("is-zoomable")) { e.preventDefault(); openLb(el); }
  });
})();
