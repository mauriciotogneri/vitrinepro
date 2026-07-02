/* ── Contact form: success / failure feedback ────────────────────────────────
   Progressive enhancement over the Formspree POST form — see
   references/site-conventions.md → "Contact & location".

   Canonical & IDENTICAL across every site — copy this file verbatim into the
   end of js/main.js (a standalone IIFE, alongside the open-status/lightbox
   IIFEs) and fill in ONLY the MESSAGES block below. It declares its own `doc`
   and depends on nothing else in the file.

   It injects its OWN status/spinner DOM at runtime — do NOT hand-author any
   .btn-label / .spinner / .form-status markup in the HTML. The <form
   class="contact-form"> just needs its normal labelled fields and a single
   <button type="submit">Envoyer le message</button>; this script wraps the
   button's existing content and appends the status region itself. This is
   deliberate: hand-authored status markup is what silently drifted out of
   sync on a bilingual site's /en mirror in practice (the French page got the
   markup, the English one didn't, and the shared main.js then couldn't show
   ANY status on the English page) — letting the script own its DOM removes
   that failure mode entirely.

   BILINGUAL SITES (an /en mirror sharing this same js/main.js): uncomment the
   `fr` line and the bilingual MESSAGES ternary below. Compute `fr` LOCALLY in
   THIS IIFE — never reuse a `fr`/`EN` flag declared inside another IIFE (e.g.
   the lightbox's), even if one already exists in the file: a flag scoped
   there can sit behind an early return (the lightbox bails out with zero
   gallery photos) and silently never execute, taking the contact form's
   language detection down with it. This file's `fr` line is the same idiom
   used everywhere else in these sites, just declared in its own scope. */
(function () {
  'use strict';
  var doc = document;
  var form = doc.querySelector('.contact-form');
  if (!form) { return; }
  var submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) { return; }

  /* var fr = (doc.documentElement.lang || 'fr').toLowerCase().indexOf('fr') === 0; */

  /* ── EDIT: per-site copy. The sentence shape stays as-is; only the phone
     number / fallback contact channel changes. Use the number exactly as it
     already reads elsewhere on THIS page (e.g. "022 700 27 14" or "+41 22 736
     45 16" — sites format it differently) — never reformat the raw tel: href
     digits yourself. If the business has no phone at all, swap in its actual
     primary channel instead (Instagram handle, WhatsApp, …) with natural
     phrasing. For a bilingual site, delete the two lines below and use:
       var MESSAGES = fr ? {
         ok: 'Merci, votre message a bien été envoyé ! Nous vous répondrons rapidement.',
         err: 'Une erreur est survenue. Réessayez, ou appelez-nous au +41 22 000 00 00.'
       } : {
         ok: "Thank you, your message has been sent! We'll get back to you shortly.",
         err: 'Something went wrong. Please try again, or call us on +41 22 000 00 00.'
       };
     ────────────────────────────────────────────────────────────────────── */
  var MESSAGES = {
    ok: 'Merci, votre message a bien été envoyé ! Nous vous répondrons rapidement.',
    err: 'Une erreur est survenue. Réessayez, ou appelez-nous au +41 22 000 00 00.'
  };
  /* ─────────────────────────────────────────────────────────────────────── */

  /* Wrap the button's existing content (text and/or an icon) so its label can
     be hidden independently of the spinner during the busy state. */
  var label = doc.createElement('span');
  label.className = 'btn-label';
  while (submitBtn.firstChild) { label.appendChild(submitBtn.firstChild); }
  var spinner = doc.createElement('span');
  spinner.className = 'spinner';
  spinner.setAttribute('aria-hidden', 'true');
  submitBtn.appendChild(label);
  submitBtn.appendChild(spinner);

  /* Status region, injected right after the button. */
  var status = doc.createElement('div');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  var statusText = doc.createElement('p');
  statusText.className = 'form-status-text';
  status.appendChild(statusText);
  submitBtn.insertAdjacentElement('afterend', status);

  var fields = [].slice.call(form.querySelectorAll('input, textarea'));

  var setStatus = function (state, msg) {
    status.dataset.state = state;
    statusText.textContent = msg;
  };
  var setBusy = function (busy) {
    submitBtn.disabled = busy;
    submitBtn.setAttribute('aria-busy', String(busy));
    fields.forEach(function (f) { f.disabled = busy; });
  };

  form.addEventListener('submit', function (e) {
    if (!form.checkValidity()) { return; } /* let the browser report invalid fields */
    e.preventDefault();
    var data = new FormData(form); /* capture BEFORE disabling — disabled fields are excluded from FormData */
    setStatus('', '');
    setBusy(true);
    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    }).then(function (r) {
      if (r.ok) {
        form.reset();
        setStatus('ok', MESSAGES.ok);
      } else {
        setStatus('error', MESSAGES.err);
      }
    }).catch(function () {
      setStatus('error', MESSAGES.err);
    }).finally(function () {
      setBusy(false);
    });
  });
})();
