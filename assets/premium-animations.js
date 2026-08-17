// A&A Creations — Premium Animation Layer
// Adds GSAP-powered motion on top of the existing site (main.js keeps
// handling nav, forms, FAQ, currency toggle — this file is purely visual
// polish, and fails silently/gracefully if GSAP didn't load for any reason).

(function () {
  if (typeof gsap === "undefined") return; // graceful no-op if CDN failed to load
  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return; // respect accessibility preference, same as the rest of the site

  document.addEventListener("DOMContentLoaded", () => {

    // ===== Hero entrance — staggered, not just a flat fade =====
    const heroTl = gsap.timeline({ delay: 0.15 });
    const heroEyebrow = document.querySelector(".hero .eyebrow");
    const heroH1 = document.querySelector(".hero h1");
    const heroLede = document.querySelector(".hero p.lede");
    const heroActions = document.querySelector(".hero .actions");
    const heroSlider = document.querySelector(".slider-block");

    [heroEyebrow, heroH1, heroLede, heroActions, heroSlider].forEach((el) => {
      if (el) gsap.set(el, { opacity: 0, y: 24 });
    });

    if (heroEyebrow) heroTl.to(heroEyebrow, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
    if (heroH1) heroTl.to(heroH1, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.3");
    if (heroLede) heroTl.to(heroLede, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4");
    if (heroActions) heroTl.to(heroActions, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.35");
    if (heroSlider) heroTl.to(heroSlider, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.3");

    // ===== Parallax drift on decorative blobs (subtle, tied to scroll) =====
    document.querySelectorAll(".blob-layer").forEach((layer) => {
      const blobs = layer.querySelectorAll(".blob");
      blobs.forEach((blob, i) => {
        gsap.to(blob, {
          y: i % 2 === 0 ? 60 : -50,
          ease: "none",
          scrollTrigger: {
            trigger: layer.closest(".hero, .page-banner") || layer,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
    });

    // ===== Section headers: refined slide+fade on scroll, replacing the flatter CSS-only version =====
    gsap.utils.toArray(".section-head").forEach((head) => {
      gsap.fromTo(
        head,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: head, start: "top 85%" },
        }
      );
    });

    // ===== Card grids: refined stagger with a slight scale-in, richer than the CSS nth-child delays =====
    const gridSelectors = [
      ".feature-grid", ".signals-grid", ".pricing-grid", ".portfolio-grid",
      ".guarantee-grid", ".addon-strip",
    ];
    gridSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((grid) => {
        const cards = grid.children;
        if (!cards.length) return;
        gsap.fromTo(
          cards,
          { opacity: 0, y: 26, scale: 0.97 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: { trigger: grid, start: "top 88%" },
          }
        );
      });
    });

    // ===== Magnetic hover on primary buttons — subtle cursor-follow pull =====
    document.querySelectorAll(".btn-primary").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.25, y: y * 0.35, duration: 0.3, ease: "power2.out" });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
      });
    });

    // ===== Price card featured tier: gentle continuous float, more premium than a CSS pulse alone =====
    const featured = document.querySelector(".price-card.featured");
    if (featured) {
      gsap.to(featured, {
        y: -6, duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true,
      });
    }

    // ===== Nav shrink-on-scroll for a tighter, premium feel once scrolled =====
    const nav = document.querySelector("nav");
    if (nav) {
      ScrollTrigger.create({
        start: "top -80",
        end: 99999,
        toggleClass: { className: "nav-scrolled", targets: nav },
      });
    }
  });
})();
