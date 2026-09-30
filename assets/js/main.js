/* ==========================================================================
   DIAM PARTNERS — main.js
   Interactions légères, sans dépendance externe.
   ========================================================================== */
(function () {
  "use strict";

  /* ---- 1. Header : ombre au scroll ---- */
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("header--scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- 2. Menu mobile ---- */
  var burger = document.querySelector("[data-burger]");
  var navList = document.querySelector("[data-nav-list]");
  if (burger && navList) {
    burger.addEventListener("click", function () {
      var open = navList.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    });
    // Referme le menu au clic sur un lien (navigation interne)
    navList.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navList.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      });
    });
  }

  /* ---- 3. Reveal au scroll (respecte prefers-reduced-motion) ---- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- 3b. Compteurs animés (valeur finale déjà présente dans le HTML) ---- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && !reduce && "IntersectionObserver" in window) {
    var runCount = function (el) {
      var end = parseInt(el.getAttribute("data-count"), 10) || 0;
      var start = null, dur = 1400;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---- 4. Année dynamique du footer ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Messages selon la langue de la page (fr, en, zh, ar) ---- */
  var LANG = (document.documentElement.lang || "fr").slice(0, 2);
  var MSGS = {
    fr: { news: "Merci ! Votre inscription à la newsletter est bien enregistrée.", contact: "Merci, votre demande a bien été envoyée. Nous vous répondrons sous 48&nbsp;h ouvrées.",
          sending: "Envoi en cours…", error: "L'envoi n'a pas abouti. Réessayez dans un instant ou écrivez-nous directement à infosdiampartners@gmail.com." },
    en: { news: "Thank you! Your newsletter subscription has been registered.", contact: "Thank you, your request has been sent. We will reply within 48 working hours.",
          sending: "Sending…", error: "Sending failed. Please try again in a moment or email us directly at infosdiampartners@gmail.com." },
    zh: { news: "谢谢！您已成功订阅电子通讯。", contact: "谢谢，您的需求已发送，我们将在 48 个工作小时内回复。",
          sending: "正在发送……", error: "发送失败。请稍后重试，或直接发送邮件至 infosdiampartners@gmail.com。" },
    ar: { news: "شكراً! تمّ تسجيل اشتراككم في النشرة الإخبارية.", contact: "شكراً، تمّ إرسال طلبكم. سنردّ عليكم خلال 48 ساعة عمل.",
          sending: "جارٍ الإرسال…", error: "تعذّر الإرسال. يُرجى المحاولة بعد لحظات أو مراسلتنا مباشرة على infosdiampartners@gmail.com." }
  };
  var MSG = MSGS[LANG] || MSGS.fr;

  /* ---- Carte à plusieurs photos : fondu toutes les 5 s, pause au survol,
         arrêt dès que le visiteur choisit une photo (respecte prefers-reduced-motion) ---- */
  document.querySelectorAll("[data-slides]").forEach(function (box) {
    var imgs = box.querySelectorAll(":scope > img");
    var dots = box.querySelectorAll(".c-slides__dots button");
    var i = 0, timer = null, paused = false;
    function show(n) {
      i = (n + imgs.length) % imgs.length;
      imgs.forEach(function (img, k) { img.classList.toggle("is-active", k === i); });
      dots.forEach(function (d, k) { d.setAttribute("aria-pressed", k === i ? "true" : "false"); });
    }
    dots.forEach(function (d, k) {
      d.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        clearInterval(timer); timer = null; show(k);
      });
    });
    if (reduce || imgs.length < 2) return;
    box.addEventListener("mouseenter", function () { paused = true; });
    box.addEventListener("mouseleave", function () { paused = false; });
    timer = setInterval(function () { if (!paused) show(i + 1); }, 5000);
  });

  /* ---- Menu déroulant de langue (drapeaux) ---- */
  var langMenus = document.querySelectorAll("[data-lang]");
  function closeLang(box) {
    var btn = box.querySelector(".c-lang__btn");
    btn.setAttribute("aria-expanded", "false");
    box.querySelector(".c-lang__menu").hidden = true;
  }
  langMenus.forEach(function (box) {
    var btn = box.querySelector(".c-lang__btn");
    var menu = box.querySelector(".c-lang__menu");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = btn.getAttribute("aria-expanded") !== "true";
      langMenus.forEach(closeLang);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      menu.hidden = !open;
      if (open) { var cur = menu.querySelector("[aria-current]") || menu.querySelector("a"); cur.focus(); }
    });
    box.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeLang(box); btn.focus(); }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        var links = Array.prototype.slice.call(menu.querySelectorAll("a"));
        var i = links.indexOf(document.activeElement);
        if (i < 0) return;
        e.preventDefault();
        links[(i + (e.key === "ArrowDown" ? 1 : links.length - 1)) % links.length].focus();
      }
    });
  });
  document.addEventListener("click", function (e) {
    langMenus.forEach(function (box) { if (!box.contains(e.target)) closeLang(box); });
  });

  /* ---- 5. Envoi des formulaires (newsletter + contact) ----
     Service : FormSubmit (https://formsubmit.co) — contact : infosdiampartners@gmail.com, newsletter : contact@diampartners.com.
     Le tout premier envoi vers chaque adresse déclenche un e-mail d'activation à confirmer dans la boîte concernée. */
  function sendForm(form) {
    var data = new FormData(form);
    data.append("langue", LANG);
    data.append("page", location.href);
    var url = form.getAttribute("action").replace("formsubmit.co/", "formsubmit.co/ajax/");
    return fetch(url, { method: "POST", headers: { Accept: "application/json" }, body: data })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return r.ok && String(j.success) === "true"; }); })
      .catch(function () { return false; });
  }
  function setBusy(form, busy) {
    var btn = form.querySelector("[type=submit]");
    if (!btn) return;
    btn.disabled = busy;
    btn.classList.toggle("is-loading", busy);
    form.setAttribute("aria-busy", busy ? "true" : "false");
  }
  function showNote(note, text, isError) {
    note.hidden = false;
    note.textContent = text;
    note.classList.toggle("is-error", !!isError);
    note.setAttribute("role", isError ? "alert" : "status");
  }

  // Newsletter
  document.querySelectorAll("[data-newsletter]").forEach(function (form) {
    var note = form.querySelector("[data-newsletter-note]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      setBusy(form, true);
      showNote(note, MSG.sending);
      sendForm(form).then(function (ok) {
        setBusy(form, false);
        showNote(note, ok ? MSG.news : MSG.error, !ok);
        if (ok) form.reset();
      });
    });
  });

  // Formulaire de contact
  document.querySelectorAll("[data-contact-form]").forEach(function (form) {
    var note = form.querySelector("[data-contact-note]");
    if (!note) {
      note = document.createElement("p");
      note.className = "form-note";
      note.hidden = true;
      var submit = form.querySelector("[type=submit]");
      form.insertBefore(note, submit ? submit.nextSibling : null);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      setBusy(form, true);
      showNote(note, MSG.sending);
      sendForm(form).then(function (ok) {
        setBusy(form, false);
        if (!ok) { showNote(note, MSG.error, true); return; }
        note.hidden = true;
        // Bloc de succès dédié (page contact), sinon message sous le bouton.
        var successId = form.getAttribute("data-success");
        var box = successId ? document.getElementById(successId) : null;
        if (box) {
          form.style.display = "none";
          box.classList.add("show");
          box.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          note.hidden = false;
          note.innerHTML = MSG.contact;
        }
        form.reset();
      });
    });
  });
})();
