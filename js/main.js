/* Transform Salone - main.js
   Vanilla helpers: sticky header state, mobile nav, stat counters, LightWidget.
*/
(function () {
  "use strict";

  /* ---------- Sticky header: scrolled state ---------- */
  const header = document.querySelector(".site-header");
  let ticking = false;
  function updateHeaderScroll() {
    ticking = false;
    if (!header) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("is-scrolled", y > 16);
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateHeaderScroll);
    }
  }
  if (header) {
    updateHeaderScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".nav-drawer");
  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      const open = drawer.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
    });
    // Close when a link is tapped
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        drawer.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Highlight current nav link ---------- */
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("[data-nav]").forEach(function (link) {
    const target = (link.getAttribute("data-nav") || "").toLowerCase();
    if (target === path || (path === "" && target === "index.html")) {
      link.classList.add("is-active");
    }
  });

  /* ---------- Animated stat counters ----------
     Initial text content is the target (so no-JS shows it too).
     On scroll-into-view we reset to 0 and count up.
  */
  const statEls = document.querySelectorAll(".stat .num[data-count]");
  function animateStat(el) {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window && statEls.length) {
    const io2 = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateStat(entry.target);
          io2.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );
    statEls.forEach(function (el) { io2.observe(el); });
  }

  /* ---------- LightWidget activation ----------
     The iframe has a data-src pointing at a LightWidget URL. If the URL has
     been replaced with a real widget ID, swap it into src and hide the
     fallback grid. Otherwise leave the fallback showing.
  */
  const lw = document.querySelector(".lightwidget-widget");
  const fallback = document.querySelector(".ig-fallback");
  if (lw) {
    const url = lw.getAttribute("data-src") || "";
    if (url && !url.includes("REPLACE_WITH_WIDGET_ID")) {
      lw.setAttribute("src", url);
      if (fallback) fallback.style.display = "none";
      // LightWidget's auto-resize script
      const s = document.createElement("script");
      s.src = "https://cdn.lightwidget.com/widgets/lightwidget.js";
      s.async = true;
      document.body.appendChild(s);
    } else {
      // Widget not yet configured: hide the empty iframe so only the
      // fallback grid is visible.
      const embed = document.querySelector(".ig-embed");
      if (embed) embed.style.display = "none";
    }
  }

  /* ---------- Update footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
