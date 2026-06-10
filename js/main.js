/* Transform Salone - main.js
   Modern vanilla helpers. No frameworks. Progressive enhancement.
   - Theme toggle with system preference, persisted in localStorage.
   - Condensing nav, scroll progress (fallback), active-link tracking.
   - Full-screen mobile overlay with inert background, Escape to close.
   - Hero headline word-split reveal.
   - Animated stat counters and bento numbers on scroll.
   - Cursor spotlight coordinates on cards / bento tiles.
   - Magnetic primary CTAs.
   - Scrollytelling donation-impact section (IntersectionObserver).
   - LightWidget activation.
*/
(function () {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     THEME TOGGLE
     ------------------------------------------------------------------ */
  const root = document.documentElement;
  const themeToggles = document.querySelectorAll(".theme-toggle");
  const logoImgs = document.querySelectorAll(".nav-brand img, .footer-brand img");

  function isDarkTheme(theme) {
    if (theme === "dark" || theme === "light") return theme === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function updateLogos(theme) {
    const dark = isDarkTheme(theme);
    logoImgs.forEach(function (img) {
      const lightSrc = img.getAttribute("data-logo-light") || "assets/images/logo-full-light.webp";
      const darkSrc = img.getAttribute("data-logo-dark") || "assets/images/logo-full-dark.webp";
      img.src = dark ? lightSrc : darkSrc;
    });
  }

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    try { localStorage.setItem("ts-theme", theme || "auto"); } catch (e) {}
    themeToggles.forEach(function (b) {
      const current = isDarkTheme(theme) ? "dark" : "light";
      b.setAttribute("aria-pressed", current === "dark" ? "true" : "false");
      b.setAttribute("aria-label", current === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
    updateLogos(theme);
  }
  updateLogos(root.getAttribute("data-theme"));
  // Init: a tiny inline script in <head> already sets data-theme before paint.
  // Here we just wire the toggle behaviour.
  themeToggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const current = root.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      // Use View Transition if supported for a smooth theme cross-fade.
      if (document.startViewTransition && !prefersReducedMotion) {
        document.startViewTransition(function () { applyTheme(next); });
      } else {
        applyTheme(next);
      }
    });
  });

  /* ------------------------------------------------------------------
     STICKY HEADER: condensed state + scroll progress fallback
     ------------------------------------------------------------------ */
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  const supportsScrollTimeline = CSS.supports && CSS.supports("animation-timeline: scroll()");
  let ticking = false;
  function update() {
    ticking = false;
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 16);
    if (progress && !supportsScrollTimeline) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? y / max : 0;
      root.style.setProperty("--scroll-progress", p.toFixed(4));
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  /* ------------------------------------------------------------------
     MOBILE NAV OVERLAY — open, close, Escape, click-out, body lock
     ------------------------------------------------------------------ */
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".nav-drawer");
  let backdrop = document.querySelector(".nav-backdrop");
  if (!backdrop && drawer) {
    backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.appendChild(backdrop);
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-visible");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
    document.body.style.overflow = "";
  }
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-visible");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    }
    document.body.style.overflow = "hidden";
  }
  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      if (drawer.classList.contains("is-open")) closeDrawer();
      else openDrawer();
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
    if (backdrop) backdrop.addEventListener("click", closeDrawer);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) closeDrawer();
  });

  /* ------------------------------------------------------------------
     ACTIVE NAV LINK HIGHLIGHTING (by filename)
     ------------------------------------------------------------------ */
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("[data-nav]").forEach(function (link) {
    const target = (link.getAttribute("data-nav") || "").toLowerCase();
    if (target === path || (path === "" && target === "index.html")) {
      link.classList.add("is-active");
    }
  });

  /* ------------------------------------------------------------------
     HERO HEADLINE WORD-SPLIT REVEAL
     ------------------------------------------------------------------ */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.textContent = "";
    words.forEach(function (w, i) {
      const wrap = document.createElement("span");
      wrap.className = "split-word";
      const inner = document.createElement("span");
      inner.textContent = w;
      inner.style.setProperty("--i", i);
      wrap.appendChild(inner);
      el.appendChild(wrap);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  });

  /* ------------------------------------------------------------------
     ANIMATED NUMBER COUNTERS (stats + bento numbers)
     ------------------------------------------------------------------ */
  const numEls = document.querySelectorAll("[data-count]");
  function animateNumber(el) {
    const target = parseFloat(el.getAttribute("data-count")) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const prefix = el.getAttribute("data-prefix") || "";
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = target * eased;
      const rounded = target >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
      el.textContent = prefix + rounded.toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  /* Scroll reveal fallback for browsers without scroll-driven animations */
  const revealEls = document.querySelectorAll(".reveal");
  const supportsViewTimeline = CSS.supports && CSS.supports("animation-timeline: view()");
  if ("IntersectionObserver" in window && revealEls.length && !supportsViewTimeline && !prefersReducedMotion) {
    const revealIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealIo.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { revealIo.observe(el); });
  } else if (revealEls.length && (supportsViewTimeline || prefersReducedMotion)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  if ("IntersectionObserver" in window && numEls.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateNumber(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    numEls.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     CURSOR SPOTLIGHT — sets CSS variables on hover for cards/bento tiles
     ------------------------------------------------------------------ */
  const spotlightEls = document.querySelectorAll(".card, .bento-item");
  spotlightEls.forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--mx", x + "%");
      el.style.setProperty("--my", y + "%");
    });
    el.addEventListener("pointerleave", function () {
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    });
  });

  /* ------------------------------------------------------------------
     SCROLLYTELLING DONATION IMPACT
     ------------------------------------------------------------------ */
  const scrolly = document.querySelector("[data-scrolly]");
  if (scrolly && "IntersectionObserver" in window) {
    const panels = Array.from(scrolly.querySelectorAll(".scrolly-panel"));
    const card = scrolly.querySelector(".scrolly-card");
    const amountEl = scrolly.querySelector(".scrolly-amount");
    const titleEl = scrolly.querySelector(".scrolly-title");
    const descEl = scrolly.querySelector(".scrolly-description");
    if (card) card.setAttribute("aria-live", "polite");
    const dots = Array.from(scrolly.querySelectorAll(".scrolly-dots span"));
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const panel = entry.target;
        const i = panels.indexOf(panel);
        if (i < 0) return;
        panels.forEach(function (p) { p.classList.toggle("is-active", p === panel); });
        dots.forEach(function (d, di) { d.classList.toggle("is-active", di === i); });
        const amt = panel.getAttribute("data-amount");
        const title = panel.getAttribute("data-title");
        const desc = panel.getAttribute("data-desc");
        if (card) card.classList.add("is-changing");
        if (amountEl && amt) amountEl.textContent = amt;
        if (titleEl && title) titleEl.textContent = title;
        if (descEl && desc) descEl.textContent = desc;
        setTimeout(function () { if (card) card.classList.remove("is-changing"); }, 500);
      });
    }, { threshold: 0.55, rootMargin: "-15% 0px -15% 0px" });
    panels.forEach(function (p) { io.observe(p); });
  }

  /* ------------------------------------------------------------------
     LIGHTWIDGET ACTIVATION
     ------------------------------------------------------------------ */
  const lw = document.querySelector(".lightwidget-widget");
  const fallback = document.querySelector(".ig-fallback");
  if (lw) {
    const url = lw.getAttribute("data-src") || "";
    if (url && !url.includes("REPLACE_WITH_WIDGET_ID")) {
      lw.setAttribute("src", url);
      if (fallback) fallback.style.display = "none";
      const s = document.createElement("script");
      s.src = "https://cdn.lightwidget.com/widgets/lightwidget.js";
      s.async = true;
      document.body.appendChild(s);
    } else {
      const embed = document.querySelector(".ig-embed");
      if (embed) embed.style.display = "none";
    }
  }

  /* ------------------------------------------------------------------
     FLOATING DONATE PILL (mobile, after scrolling past hero)
     ------------------------------------------------------------------ */
  const donatePill = document.querySelector(".donate-pill");
  const heroSection = document.querySelector(".hero");
  if (donatePill && heroSection && "IntersectionObserver" in window) {
    const pillIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        donatePill.classList.toggle("is-visible", !entry.isIntersecting);
      });
    }, { threshold: 0, rootMargin: "-20% 0px 0px 0px" });
    pillIo.observe(heroSection);
  }

  /* ------------------------------------------------------------------
     CONTACT FORM SUCCESS NOTICE
     ------------------------------------------------------------------ */
  const formNotice = document.getElementById("form-success");
  if (formNotice && /[?&]sent=1/.test(location.search)) {
    formNotice.hidden = false;
    formNotice.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
    if (history.replaceState) {
      history.replaceState(null, "", location.pathname);
    }
  }

  /* ------------------------------------------------------------------
     FOOTER YEAR
     ------------------------------------------------------------------ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
