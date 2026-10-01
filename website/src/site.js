/* BK Electrician — site behaviour. No dependencies. */
(function () {
  "use strict";

  /* ---------- mobile menu ---------- */

  var root = document.documentElement;
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    root.classList.toggle("nav-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("nav-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    // Leaving phone width with the menu open would leave it stuck open.
    window.matchMedia("(min-width: 901px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- enquiry form ---------- */

  var form = document.getElementById("enquiry");
  if (!form) return;

  var status = form.querySelector(".form-status");
  var provider = form.getAttribute("data-provider");
  var live = /^https?:$/.test(location.protocol);
  var MAX_PHOTO_BYTES = 8 * 1024 * 1024;

  function digits(v) { return v.replace(/\D/g, ""); }

  // Australian numbers: mobiles and landlines with or without +61, plus
  // 1300 / 1800 and 13 numbers.
  function validPhone(v) {
    var d = digits(v);
    return /^0[2-478]\d{8}$/.test(d) || /^61[2-478]\d{8}$/.test(d) ||
      /^1[38]00\d{6}$/.test(d) || /^13\d{4}$/.test(d);
  }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function setError(input, message) {
    var err = document.getElementById(input.id + "-err");
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (message) input.setAttribute("aria-describedby", input.id + "-err");
    else input.removeAttribute("aria-describedby");
    if (err) { err.textContent = message || ""; err.hidden = !message; }
  }

  function check() {
    var bad = [];
    function need(id, test, message) {
      var el = document.getElementById(id);
      if (!el) return;
      var ok = test(el.value.trim(), el);
      setError(el, ok ? "" : message);
      if (!ok) bad.push(el);
    }
    need("f-name", function (v) { return v.length >= 2; }, "Please tell us your name.");
    need("f-phone", validPhone, "Please enter an Australian phone number, e.g. 0412 345 678.");
    need("f-email", function (v) { return !v || validEmail(v); }, "That email address doesn’t look right.");
    need("f-suburb", function (v) { return v.length >= 2; }, "Which suburb is the job in?");
    need("f-message", function (v) { return v.length >= 5; }, "A few words about the job, please.");
    need("f-photos", function (v, el) {
      var total = 0;
      for (var i = 0; i < el.files.length; i++) total += el.files[i].size;
      return total <= MAX_PHOTO_BYTES;
    }, "Photos are too large — please keep them under 8 MB in total.");
    return bad;
  }

  function show(kind, html) {
    status.className = "form-status is-" + kind;
    status.innerHTML = html;
    status.hidden = false;
    status.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Clear an error as soon as the person fixes it.
  form.addEventListener("input", function (e) {
    if (e.target.getAttribute("aria-invalid") === "true") setError(e.target, "");
  });

  form.addEventListener("submit", function (e) {
    var bad = check();
    if (bad.length) {
      e.preventDefault();
      bad[0].focus();
      return;
    }

    // Netlify handles the POST itself once the site is hosted there.
    if (provider === "netlify" && live) return;

    e.preventDefault();

    if (provider === "formspree" && live) {
      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          show("ok", "<strong>Thanks — we have your enquiry.</strong> We’ll be in touch soon.");
        })
        .catch(function () {
          show("err", "<strong>Sorry, that didn’t send.</strong> Please call us instead.");
        })
        .then(function () { button.disabled = false; });
      return;
    }

    // Sample mode: everything above works, but nothing is sent anywhere yet.
    show("sample", "<strong>Looks good — but this is a sample site.</strong> The form isn’t connected yet, so nothing was sent. Set <code>form.provider</code> in content.js to switch it on.");
  });
})();
