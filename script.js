(() => {
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  // Year
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Smooth scroll (with offset for sticky header)
  const header = document.querySelector("[data-header]");
  const headerHeight = () => header?.getBoundingClientRect().height ?? 0;

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - headerHeight() - 14;
    window.scrollTo({ top: Math.max(0, y), behavior: prefersReduced ? "auto" : "smooth" });
  }

  document.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a[href^='#']");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    const id = href.slice(1);
    if (!id) return;
    e.preventDefault();
    scrollToId(id);
    history.pushState(null, "", `#${id}`);

    // close mobile nav on selection
    if (nav?.classList.contains("is-open")) closeNav();
  });

  // Trainer profile cards: clickable + keyboard accessible
  function openProfileFrom(el) {
    const href = el?.getAttribute?.("data-profile-href");
    if (!href) return;
    window.location.href = href;
  }

  document.addEventListener("click", (e) => {
    const card = e.target?.closest?.("[data-profile-href]");
    if (!card) return;
    // Prevent accidental activation when selecting text
    const sel = window.getSelection?.();
    if (sel && String(sel).trim()) return;
    openProfileFrom(card);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = document.activeElement?.closest?.("[data-profile-href]");
    if (!card) return;
    e.preventDefault();
    openProfileFrom(card);
  });

  // Mobile nav
  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navPanel = document.querySelector("[data-nav-panel]");

  function openNav() {
    if (!nav || !navToggle) return;
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
  }
  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.contains("is-open");
    if (isOpen) closeNav();
    else openNav();
  });

  // Close nav on outside click / Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
  document.addEventListener("click", (e) => {
    if (!nav || !navPanel || !navToggle) return;
    const target = e.target;
    if (nav.contains(target)) return;
    closeNav();
  });

  // Header compact on scroll
  let lastCompact = false;
  const onScroll = () => {
    if (!header) return;
    const compact = window.scrollY > 6;
    if (compact !== lastCompact) {
      header.classList.toggle("is-compact", compact);
      lastCompact = compact;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal animations
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          const delay = Number(el.getAttribute("data-reveal-delay") || "0");
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.classList.add("is-in");
          io.unobserve(el);
        }
      },
      { threshold: 0.14 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  // CTA form: offline friendly (no network). Just a premium confirmation.
  const form = document.querySelector("[data-form]");
  const successEl = document.querySelector("[data-form-success]");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const style = String(fd.get("style") || "").trim();
    if (successEl) {
      successEl.textContent = name
        ? `Дякуємо, ${name}! Ми зв’яжемося з вами щодо напряму: ${style}.`
        : `Дякуємо! Ми зв’яжемося з вами найближчим часом.`;
    }
    form.reset();
    // keep style selection visually stable for some browsers
    const select = form.querySelector("select[name='style']");
    if (select) select.selectedIndex = 0;
  });

  // If page loads with a hash, offset-scroll correctly.
  if (location.hash?.length > 1) {
    const id = location.hash.slice(1);
    // Wait for layout
    requestAnimationFrame(() => scrollToId(id));
  }
})();
