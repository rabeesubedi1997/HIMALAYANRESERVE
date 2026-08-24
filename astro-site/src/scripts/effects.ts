// Site-wide interactive effects — vanilla TS port of the original React
// "use client" components. Bundled once by Astro/Vite and loaded on every page.
import Lenis from "lenis";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------------------
// Reveal-on-scroll (.reveal elements get .is-visible when they enter view)
// ---------------------------------------------------------------------------
function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------------
// Animated number counters ([data-counter] elements)
// ---------------------------------------------------------------------------
function initCounters() {
  const els = document.querySelectorAll<HTMLElement>("[data-counter]");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const value = Number(el.dataset.counter ?? "0");
        const numEl = el.querySelector<HTMLElement>("[data-counter-num]") ?? el;
        const t0 = performance.now();
        const duration = 1800;
        const tick = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          numEl.textContent = Math.round(eased * value).toLocaleString("en-US");
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      }
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------------
// Custom cursor (desktop / fine-pointer only)
// ---------------------------------------------------------------------------
function initCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (prefersReducedMotion()) return;

  const ring = document.createElement("div");
  ring.setAttribute("aria-hidden", "true");
  ring.className =
    "fixed left-0 top-0 z-[120] h-10 w-10 -translate-x-20 -translate-y-20 rounded-full border border-white/30 opacity-0 transition-[border-color] duration-300 [transition-timing-function:var(--ease-lux)]";
  ring.style.pointerEvents = "none";

  const dot = document.createElement("div");
  dot.setAttribute("aria-hidden", "true");
  dot.className = "fixed left-0 top-0 z-[120] h-1 w-1 rounded-full bg-gold opacity-0";
  dot.style.pointerEvents = "none";

  document.body.append(ring, dot);

  let mx = -100, my = -100, rx = -100, ry = -100, visible = false;

  const onMove = (e: MouseEvent) => {
    mx = e.clientX;
    my = e.clientY;
    if (!visible) {
      visible = true;
      ring.style.opacity = "1";
      dot.style.opacity = "1";
    }
  };
  const onOver = (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    const interactive = t.closest("a, button, [role='button'], input, select, textarea, label");
    ring.classList.toggle("scale-150", !!interactive);
    ring.classList.toggle("border-gold", !!interactive);
  };
  const onLeave = () => {
    visible = false;
    ring.style.opacity = "0";
    dot.style.opacity = "0";
  };
  const loop = () => {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate3d(${rx - 20}px, ${ry - 20}px, 0)`;
    dot.style.transform = `translate3d(${mx - 2}px, ${my - 2}px, 0)`;
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseover", onOver, { passive: true });
  document.documentElement.addEventListener("mouseleave", onLeave);
}

// ---------------------------------------------------------------------------
// Parallax ([data-parallax] elements, optional data-parallax-speed)
// ---------------------------------------------------------------------------
function initParallax() {
  if (prefersReducedMotion()) return;
  const els = document.querySelectorAll<HTMLElement>("[data-parallax]");
  if (!els.length) return;

  const items = Array.from(els).map((el) => ({
    el,
    speed: Number(el.dataset.parallaxSpeed ?? "-0.12"),
    current: 0,
    target: 0,
  }));

  const onScroll = () => {
    const viewport = window.innerHeight;
    for (const item of items) {
      const rect = item.el.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      item.target = progress * item.speed * 100;
    }
  };
  const loop = () => {
    for (const item of items) {
      item.current += (item.target - item.current) * 0.08;
      item.el.style.transform = `translate3d(0, ${item.current.toFixed(2)}%, 0)`;
    }
    requestAnimationFrame(loop);
  };

  onScroll();
  requestAnimationFrame(loop);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

// ---------------------------------------------------------------------------
// Scroll progress bar
// ---------------------------------------------------------------------------
function initScrollProgress() {
  const wrap = document.getElementById("scroll-progress");
  const bar = document.getElementById("scroll-progress-bar");
  if (!wrap || !bar) return;

  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? doc.scrollTop / max : 0;
    bar.style.transform = `scaleX(${p})`;
    wrap.style.opacity = doc.scrollTop > 48 ? "1" : "0";
  };
  requestAnimationFrame(onScroll);
  window.addEventListener("scroll", onScroll, { passive: true });
}

// ---------------------------------------------------------------------------
// Smooth scroll (Lenis) + in-page anchor scrolling
// ---------------------------------------------------------------------------
function initSmoothScroll() {
  if (prefersReducedMotion()) return;
  document.documentElement.classList.add("lenis");

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  const loop = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
    if (!target) return;
    const href = target.getAttribute("href");
    if (!href || href === "#") return;
    const el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el as HTMLElement, {
      offset: -72,
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  });
}

// ---------------------------------------------------------------------------
// Preloader
// ---------------------------------------------------------------------------
function initPreloader() {
  const el = document.getElementById("preloader");
  if (!el) return;
  const hide = () => {
    el.classList.add("pointer-events-none", "opacity-0");
    window.setTimeout(() => el.remove(), 700);
  };
  window.setTimeout(hide, 1900);
  window.addEventListener("load", hide, { once: true });
}

// ---------------------------------------------------------------------------
// Navbar: scrolled state, active-section highlight, mobile menu
// ---------------------------------------------------------------------------
function initNavbar() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("border-b", true);
    if (window.scrollY > 48) {
      header.classList.add("bg-ink/85", "backdrop-blur-md", "hairline-gold");
      header.classList.remove("border-transparent", "bg-transparent");
    } else {
      header.classList.remove("bg-ink/85", "backdrop-blur-md", "hairline-gold");
      header.classList.add("border-transparent", "bg-transparent");
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const links = document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]");
  const sections = Array.from(links)
    .map((a) => document.getElementById(a.dataset.navLink ?? ""))
    .filter((el): el is HTMLElement => !!el);

  const setActive = (id: string) => {
    links.forEach((a) => {
      const active = a.dataset.navLink === id;
      a.classList.toggle("text-gold", active);
      a.classList.toggle("text-paper-dim", !active);
      const underline = a.querySelector<HTMLElement>("[data-nav-underline]");
      if (underline) underline.classList.toggle("w-full", active);
    });
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => io.observe(s));

  const menuBtn = document.getElementById("mobile-menu-btn");
  const menuPanel = document.getElementById("mobile-menu");
  if (menuBtn && menuPanel) {
    let open = false;
    const setOpen = (v: boolean) => {
      open = v;
      menuBtn.setAttribute("aria-expanded", String(open));
      menuPanel.classList.toggle("opacity-100", open);
      menuPanel.classList.toggle("opacity-0", !open);
      menuPanel.classList.toggle("pointer-events-none", !open);
      document.documentElement.style.overflow = open ? "hidden" : "";
      menuBtn.querySelectorAll("span").forEach((s, i) => {
        s.classList.toggle(i === 0 ? "translate-y-[3.5px]" : "-translate-y-[3.5px]", open);
        s.classList.toggle(i === 0 ? "rotate-45" : "-rotate-45", open);
      });
    };
    menuBtn.addEventListener("click", () => setOpen(!open));
    menuPanel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  }
}

// ---------------------------------------------------------------------------
// Footer back-to-top visibility
// ---------------------------------------------------------------------------
function initFooter() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  const onScroll = () => btn.classList.toggle("opacity-60", window.scrollY <= 700);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ---------------------------------------------------------------------------
// Currency toggle (Crown Collections pricing)
// ---------------------------------------------------------------------------
function initCurrencyToggle() {
  const toggle = document.querySelector<HTMLElement>("[data-currency-toggle]");
  if (!toggle) return;
  const buttons = toggle.querySelectorAll<HTMLButtonElement>("[data-currency]");
  const priceEls = document.querySelectorAll<HTMLElement>("[data-price]");

  const datasetKey: Record<string, "priceAed" | "priceUsd" | "priceNpr"> = {
    AED: "priceAed",
    USD: "priceUsd",
    NPR: "priceNpr",
  };

  const apply = (currency: string) => {
    buttons.forEach((b) => {
      const active = b.dataset.currency === currency;
      b.classList.toggle("bg-gold", active);
      b.classList.toggle("text-ink", active);
      b.classList.toggle("text-paper-dim", !active);
    });
    priceEls.forEach((el) => {
      const value = el.dataset[datasetKey[currency] ?? "priceAed"];
      const symbol = currency === "AED" ? "AED " : currency === "USD" ? "$" : "NPR ";
      const amountEl = el.querySelector<HTMLElement>("[data-price-amount]");
      if (amountEl && value) amountEl.textContent = `${symbol}${Number(value).toLocaleString("en-US")}`;
    });
  };

  buttons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.currency!)));
  apply("AED");
}

// ---------------------------------------------------------------------------
// Allocation form
// ---------------------------------------------------------------------------
function initAllocationForm() {
  const form = document.querySelector<HTMLFormElement>("[data-allocation-form]");
  if (!form) return;

  const waNumber = form.dataset.whatsapp ?? "";
  const email = form.dataset.email ?? "";
  const errorEls = form.querySelectorAll<HTMLElement>("[data-error-for]");
  const serverMsgEl = form.querySelector<HTMLElement>("[data-server-msg]");
  const doneEl = form.querySelector<HTMLElement>("[data-done-msg]");
  const submitBtns = form.querySelectorAll<HTMLButtonElement>("button");

  const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null)?.value?.trim() ?? "";

  const clearError = (name: string) => {
    const el = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (el) el.textContent = "";
  };
  const setError = (name: string, msg: string) => {
    const el = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (el) el.textContent = msg;
  };

  form.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", () => clearError((el as HTMLInputElement).name));
  });

  function validate(): boolean {
    let ok = true;
    errorEls.forEach((el) => (el.textContent = ""));
    if (get("fullName").length < 2) { setError("fullName", "Please enter your full name"); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get("email"))) { setError("email", "Please enter a valid email address"); ok = false; }
    if (get("phone").length < 6) { setError("phone", "Please enter a valid phone / WhatsApp number"); ok = false; }
    if (get("countryCity").length < 2) { setError("countryCity", "Please enter country / city"); ok = false; }
    if (!get("inquiryType")) { setError("inquiryType", "Please select an inquiry type"); ok = false; }
    return ok;
  }

  function buildMessage(): string {
    const typeLabel = (form.querySelector<HTMLSelectElement>('[name="inquiryType"]'))?.selectedOptions?.[0]?.textContent ?? get("inquiryType");
    return [
      "HIMALAYAN RESERVE — PRIVATE ALLOCATION REQUEST",
      "",
      `Name: ${get("fullName")}`,
      `Email: ${get("email")}`,
      `Phone/WhatsApp: ${get("phone")}`,
      `Country/City: ${get("countryCity")}`,
      `Inquiry Type: ${typeLabel}`,
      get("message") ? `Message: ${get("message")}` : "",
    ].filter(Boolean).join("\n");
  }

  async function submit(channel: "form" | "whatsapp" | "mailto") {
    if (get("website")) return; // honeypot
    if (!validate()) return;

    submitBtns.forEach((b) => (b.disabled = true));
    if (serverMsgEl) serverMsgEl.textContent = "";

    try {
      const res = await fetch("/api/allocations.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: get("fullName"),
          email: get("email"),
          phone: get("phone"),
          countryCity: get("countryCity"),
          inquiryType: get("inquiryType"),
          message: get("message"),
          channel,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (serverMsgEl) serverMsgEl.textContent = body?.error ?? "Something went wrong. Please try again.";
        submitBtns.forEach((b) => (b.disabled = false));
        return;
      }
    } catch {
      if (serverMsgEl) serverMsgEl.textContent = "Network error. Please try again.";
      submitBtns.forEach((b) => (b.disabled = false));
      return;
    }

    if (channel === "whatsapp") {
      window.open(`https://wa.me/${waNumber.replace(/\D/g, "")}?text=${encodeURIComponent(buildMessage())}`, "_blank", "noopener");
    } else if (channel === "mailto") {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent("Himalayan Reserve — Private Allocation Request")}&body=${encodeURIComponent(buildMessage())}`;
    }
    if (doneEl) {
      doneEl.classList.remove("hidden");
      doneEl.classList.add("flex");
    }
    submitBtns.forEach((b) => (b.disabled = false));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submit("form");
  });
  form.querySelector('[data-channel="whatsapp"]')?.addEventListener("click", () => submit("whatsapp"));
  form.querySelector('[data-channel="mailto"]')?.addEventListener("click", () => submit("mailto"));
}

function init() {
  initPreloader();
  initReveal();
  initCounters();
  initCursor();
  initParallax();
  initScrollProgress();
  initSmoothScroll();
  initNavbar();
  initFooter();
  initCurrencyToggle();
  initAllocationForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
