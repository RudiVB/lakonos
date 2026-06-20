"use client";

/* =====================================================================
   LAKONOS — premium homepage (upgraded)
   Adds, vs the previous version:
   1. TRUE NODE MORPH — one SVG whose nodes interpolate scattered → networked
      → orbiting-core by scroll progress (not 3 cross-faded scenes).
   2. MOUSE PARALLAX — visual + aurora drift toward the cursor (desktop only).
   3. LENIS smooth/inertia scroll (graceful: site still works if not installed).
   4. PER-LETTER headline reveals on each scene.
   5. CONVERSION — floating WhatsApp button, FAQ accordion, testimonial.
   6. SEO — Organization + FAQ JSON-LD (OG image / sitemap / robots are
      separate route files: opengraph-image.tsx, sitemap.ts, robots.ts).
   100% self-contained + scoped under .lx — never affects /admin or /portal.
   Requires:  npm install lenis     (optional; degrades gracefully without it)
   ===================================================================== */

import { useEffect, useRef } from "react";
import LeadForm from "@/components/LeadForm";
import ShaderField from "@/components/ShaderField";
import Interactions from "@/components/Interactions";
import Intro from "@/components/Intro";

/* ---- site + contact constants ---- */
const SITE = "https://lakonos.com"; // <-- if the custom domain isn't live yet, use "https://lakonos.vercel.app"
const WHATSAPP = "27XXXXXXXXX"; // <-- REPLACE with the real WhatsApp number (SA format: 27 + number, no + and no leading 0)
const WHATSAPP_MSG = "Hi Lakonos, I'd like a free quote on automating some manual work in my business.";

/* ---- content data ---- */
const STATS = [
  { n: "40,000", l: "Picks / day" },
  { n: "97%", l: "Pick accuracy" },
  { n: "40→24", l: "Staff, same output" },
  { n: "R8.5m", l: "Saved / year" },
];

const MODULES = [
  { icon: "box", t: "Warehouse & fulfilment", d: "Picking, scanning and dispatch run themselves — accurate to the unit, no manual counts." },
  { icon: "auto", t: "Production", d: "Planning, scheduling and floor tracking without spreadsheets or guesswork." },
  { icon: "check", t: "Quality & compliance", d: "Checks, traceability and FSSC 22000 paperwork, handled end to end." },
  { icon: "bolt", t: "Maintenance", d: "Job cards, preventive schedules and asset tracking that trigger themselves." },
  { icon: "layers", t: "Procurement & stock", d: "Receiving, reordering and a stock ledger that always reconciles." },
  { icon: "doc", t: "Admin & office", d: "Data capture, reports and reconciliations — the repetitive grind, done for you." },
];

const TIERS = [
  { tag: "Small", t: "A single manual job", d: "One repetitive task automated end to end. Days, not months.", eg: "e.g. an order → Sage sync" },
  { tag: "Mid-size", feat: true, t: "A whole department", d: "One area run end to end, with the manual labour designed out of it.", eg: "e.g. paperless dispatch" },
  { tag: "Large", t: "Your whole operation", d: "Every department on one system, built from scratch and run with you.", eg: "e.g. a full ERP / WMS" },
];

const STEPS = [
  { k: "01", t: "Tell us what’s manual", d: "Send a note or book a call. We look at what your team repeats by hand today." },
  { k: "02", t: "Get a fixed quote", d: "We come back fast with exactly what we’d automate and what it costs — no surprises." },
  { k: "03", t: "We build & run it", d: "Built from scratch, installed, your data migrated, and improved as you grow." },
];

const FAQ = [
  { q: "What does it cost?", a: "Every build gets a fixed quote up front. A single automation is priced per job; a whole department is priced as a project. No hourly billing and no surprises." },
  { q: "How long does it take?", a: "A single manual task can be live in days. A full department runs over a few weeks, scoped in phases so you see value early instead of waiting for one big launch." },
  { q: "Will it replace my staff?", a: "It removes the repetitive manual work, not the people. Your team stops keying data and counting clipboards, and spends that time on work that actually needs a human." },
  { q: "Is my data safe?", a: "Your data stays in your own database and your own accounts. We build on infrastructure you own and control — nothing is locked inside a third party." },
  { q: "Do you only do warehouses?", a: "No. Warehouse is just where most operators start. Anything repetitive — production, quality, procurement, finance, admin — can be automated the same way." },
  { q: "We already run Sage / WooCommerce / other systems.", a: "Good. We integrate with what you already have and automate the manual glue between systems, rather than ripping anything out and starting over." },
];

/* node layouts (viewBox 0 0 600 360) — scattered → networked → ring */
const SCATTER = [[90, 70], [300, 50], [510, 80], [60, 190], [235, 165], [430, 200], [545, 180], [140, 300], [330, 300], [480, 300]];
const NET = [[150, 95], [300, 70], [450, 95], [110, 190], [250, 170], [390, 185], [490, 190], [185, 285], [325, 290], [445, 280]];
const RING = [[418, 180], [395.5, 249.4], [336.5, 292.2], [263.5, 292.2], [204.5, 249.4], [182, 180], [204.5, 110.6], [263.5, 67.8], [336.5, 67.8], [395.5, 110.6]];
const EDGES = [[0, 1], [1, 2], [0, 3], [3, 4], [1, 4], [4, 5], [2, 6], [5, 6], [4, 8], [3, 7], [7, 8], [8, 9], [5, 9]];

/* the three scene captions */
const CAPS = [
  { h: "Your business runs on manual work.", p: "Orders keyed in by hand. Stock counted on clipboards. Paperwork chasing paperwork — slow, and a mistake waiting to happen." },
  { h: "We build one system around how you work.", p: "Not off-the-shelf. Built from scratch to fit your floor, your rules and your process — connecting the work that used to be done by hand." },
  { h: "Then it runs itself.", p: "Picking, production, quality and admin — accurate, automatic and at scale. One system that does the work of an entire team." },
];

/* split a string into per-word / per-letter spans for staggered reveal */
function Split({ text, start = 0 }: { text: string; start?: number }) {
  let i = start;
  return (
    <>
      {text.split(" ").map((word, wi) => (
        <span className="lx-word" key={wi}>
          {word.split("").map((ch, ci) => (
            <span className="lx-ch" style={{ ["--i"]: i++ } as React.CSSProperties} key={ci}>{ch}</span>
          ))}
        </span>
      ))}
    </>
  );
}

/* premium line icons */
function Icon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "url(#lxg)", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" {...common}>
      {name === "box" && (<><path d="M3.2 7.5 12 3l8.8 4.5v9L12 21l-8.8-4.5z" /><path d="M3.2 7.5 12 12l8.8-4.5M12 12v9" /></>)}
      {name === "auto" && (<><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19" /></>)}
      {name === "check" && (<><circle cx="12" cy="12" r="9" /><path d="M8.2 12.4l2.6 2.6 5-5.4" /></>)}
      {name === "bolt" && (<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z" />)}
      {name === "layers" && (<><path d="M12 3 21 8l-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></>)}
      {name === "doc" && (<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></>)}
    </svg>
  );
}

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const visRef = useRef<HTMLDivElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const wrap = wrapRef.current;
    const svg = visRef.current?.querySelector("svg");
    if (!root || !wrap || !svg) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce) root.classList.add("reduced");

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const ease = (t: number) => t * t * (3 - 2 * t);

    /* grab morph elements */
    const nodes = Array.from(svg.querySelectorAll<SVGCircleElement>(".lx-node"));
    const lines = Array.from(svg.querySelectorAll<SVGLineElement>(".lx-edge"));
    const ring = svg.querySelector<SVGCircleElement>(".lx-ring");
    const core = svg.querySelector<SVGCircleElement>(".lx-core");
    const halo = svg.querySelector<SVGCircleElement>(".lx-halo");
    const caps = Array.from(root.querySelectorAll<HTMLElement>(".lx-cap"));

    /* node positions for a given progress p (0..1) */
    const layout = (p: number) => {
      const seg = p * 2;
      return SCATTER.map((_, i) => {
        if (seg <= 1) {
          const t = ease(seg);
          return { x: lerp(SCATTER[i][0], NET[i][0], t), y: lerp(SCATTER[i][1], NET[i][1], t), r: lerp(6, 6.5, t), o: lerp(0.45, 1, t) };
        }
        const t = ease(seg - 1);
        return { x: lerp(NET[i][0], RING[i][0], t), y: lerp(NET[i][1], RING[i][1], t), r: lerp(6.5, 5.5, t), o: 1 };
      });
    };

    let lastActive = -1;

    /* ---- main scroll update: morph + scene captions + progress bar ---- */
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;

      /* morph the single visual */
      const pts = layout(p);
      nodes.forEach((c, i) => {
        c.setAttribute("cx", pts[i].x.toFixed(1));
        c.setAttribute("cy", pts[i].y.toFixed(1));
        c.setAttribute("r", pts[i].r.toFixed(1));
        c.style.fillOpacity = pts[i].o.toFixed(2);
      });
      const eo = p * 2 <= 1 ? ease(p * 2) * 0.5 : lerp(0.5, 0.4, ease(p * 2 - 1));
      lines.forEach((ln, i) => {
        const [a, b] = EDGES[i];
        ln.setAttribute("x1", pts[a].x.toFixed(1)); ln.setAttribute("y1", pts[a].y.toFixed(1));
        ln.setAttribute("x2", pts[b].x.toFixed(1)); ln.setAttribute("y2", pts[b].y.toFixed(1));
        ln.style.opacity = eo.toFixed(2);
      });
      const bWeight = p <= 0.5 ? 0 : ease((p - 0.5) / 0.5); // ring/core appear in 2nd half
      if (ring) ring.style.opacity = (bWeight * 0.6).toFixed(2);
      if (core) core.style.opacity = bWeight.toFixed(2);
      if (halo) halo.style.opacity = (bWeight * 0.5).toFixed(2);

      /* scene caption weights (cross-fade) + active scene for letter reveal */
      const seg = p * 2;
      let w: number[];
      if (seg <= 1) { const t = ease(seg); w = [1 - t, t, 0]; }
      else { const t = ease(seg - 1); w = [0, 1 - t, t]; }
      caps.forEach((el, i) => {
        el.style.opacity = String(w[i]);
        el.style.transform = `translateY(${(1 - w[i]) * 18}px)`;
      });
      const active = w.indexOf(Math.max(...w));
      if (active !== lastActive) {
        caps.forEach((el, i) => (el.dataset.on = i === active ? "true" : "false"));
        lastActive = active;
      }

      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (hintRef.current) hintRef.current.style.opacity = p < 0.04 ? "1" : "0";
      if (navRef.current) navRef.current.classList.toggle("solid", window.scrollY > 16);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();

    /* ---- mouse parallax (desktop only) ---- */
    let pRaf = 0; let px = 0, py = 0, tx = 0, ty = 0;
    const onPointer = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tickParallax = () => {
      px += (tx - px) * 0.06; py += (ty - py) * 0.06;
      if (visRef.current) visRef.current.style.transform = `translate3d(${(px * 16).toFixed(1)}px,${(py * 16).toFixed(1)}px,0)`;
      if (auroraRef.current) auroraRef.current.style.transform = `translate3d(${(px * 30).toFixed(1)}px,${(py * 30).toFixed(1)}px,0)`;
      pRaf = requestAnimationFrame(tickParallax);
    };
    if (!reduce && !coarse) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      pRaf = requestAnimationFrame(tickParallax);
    }

    /* ---- scroll-reveal + count-up for content sections ---- */
    const reveals = Array.from(root.querySelectorAll<HTMLElement>(".lx-reveal"));
    let io: IntersectionObserver | null = null;
    let numIo: IntersectionObserver | null = null;
    if (reduce) {
      reveals.forEach((el) => el.classList.add("in"));
    } else {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io!.unobserve(e.target); } }),
        { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
      );
      reveals.forEach((el) => io!.observe(el));

      const statsBox = root.querySelector(".lx-stats");
      const nums = statsBox ? Array.from(statsBox.querySelectorAll<HTMLElement>(".lx-num")) : [];
      const parse = (txt: string) => {
        if (/\d\s*[→\-–]\s*\d/.test(txt)) return null;
        const m = txt.match(/^([^\d]*)([\d,.\s]+)(.*)$/);
        if (!m) return null;
        const raw = m[2].replace(/[,\s]/g, "");
        const num = parseFloat(raw);
        if (isNaN(num)) return null;
        return { prefix: m[1], num, suffix: m[3], decimals: (raw.split(".")[1] || "").length, comma: /,/.test(m[2]) };
      };
      numIo = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement; numIo!.unobserve(el);
          const original = el.textContent || ""; const pr = parse(original); if (!pr) return;
          const t0 = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - t0) / 1100, 1); const eased = 1 - Math.pow(1 - t, 3);
            const val = pr.comma ? Math.round(pr.num * eased).toLocaleString("en-ZA") : (pr.num * eased).toFixed(pr.decimals);
            el.textContent = pr.prefix + val + pr.suffix;
            if (t < 1) requestAnimationFrame(tick); else el.textContent = original;
          };
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.5 });
      nums.forEach((el) => numIo!.observe(el));
    }

    /* ---- Lenis smooth scroll (optional dependency; degrades gracefully) ---- */
    let lenis: any = null; let lRaf = 0;
    const smoothAnchors = (e: Event) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      const target = root.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -10 });
      else target.scrollIntoView({ behavior: "smooth" });
      if (a.classList.contains("lx-skip")) { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
      if (id === "#start") (window as unknown as { va?: (e: string, p?: unknown) => void }).va?.("event", { name: "quote_click" });
    };
    root.addEventListener("click", smoothAnchors);

    if (!reduce) {
      import("lenis").then(({ default: Lenis }) => {
        lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
        const raf = (time: number) => { lenis.raf(time); lRaf = requestAnimationFrame(raf); };
        lRaf = requestAnimationFrame(raf);
        lenis.on("scroll", update);
      }).catch(() => { /* not installed — native scroll is fine */ });
    }

    /* ---- cleanup ---- */
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      window.removeEventListener("pointermove", onPointer);
      root.removeEventListener("click", smoothAnchors);
      if (pRaf) cancelAnimationFrame(pRaf);
      if (lRaf) cancelAnimationFrame(lRaf);
      if (lenis) lenis.destroy();
      io?.disconnect();
      numIo?.disconnect();
    };
  }, []);

  /* ---- persistent box: assembles in the hero, then shrinks + docks to a corner
         and STAYS on screen (fixed) all the way down to the footer ---- */
  useEffect(() => {
    const wrap = wrapRef.current;                                        // the tall hero section
    const cubeWrap = document.querySelector<HTMLElement>(".lx-cube-wrap");
    const cube = document.querySelector<HTMLElement>(".lx-cube");
    const dots = Array.from(document.querySelectorAll<HTMLElement>(".lx-progdot"));
    if (!cube || !cubeWrap) return;                                      // box must exist (hero ref optional)

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clamp = (v: number) => Math.min(Math.max(v, 0), 1);            // 0..1 limiter
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;   // linear interpolate
    let raf = 0;
    const t0 = performance.now();
    let lastStep = -1;
    const setStep = (s: number) => {                                     // light up the active progress dot
      if (s === lastStep) return;
      dots.forEach((d, i) => d.classList.toggle("on", i === s));
      lastStep = s;
    };

    const place = (now: number) => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const heroH = wrap ? wrap.offsetHeight : vh * 3;                   // total hero scroll height
      const heroPin = Math.max(heroH - vh, 1);                          // scroll span of the hero story
      const y = window.scrollY || window.pageYOffset || 0;              // whole-page scroll position
      const hp = clamp(y / heroPin);                                    // hero progress: assemble + come alive
      const dock = clamp((y - heroPin) / (vh * 0.8));                   // 0 during hero -> 1 once parked in corner

      // panels fly together over the first ~45% of the hero; core/orbit switch on later and stay on
      cubeWrap.style.setProperty("--assemble", clamp(hp / 0.45).toFixed(3));
      cubeWrap.style.setProperty("--live", Math.max(clamp((hp - 0.55) / 0.3), dock).toFixed(3));

      // rotation: gentle always-on idle spin + extra spin driven by hero scroll
      const idle = reduce ? 0 : ((now - t0) / 1000) * 8;
      cube.style.transform = `rotateX(-18deg) rotateY(${(idle + hp * 200).toFixed(2)}deg)`;

      // position: centre of the screen during the hero, then shrink + dock to the
      // BOTTOM-LEFT corner (kept off the bottom-right so it never sits on the WhatsApp button)
      const cx = lerp(vw * 0.5, 74, dock);                             // x of box centre, px
      const cy = lerp(vh * 0.42, vh - 74, dock);                       // y of box centre, px
      const s  = lerp(1, 0.4, dock);                                   // 100% -> 40% size
      cubeWrap.style.transform =
        `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px) translate(-50%,-50%) scale(${s.toFixed(3)})`;

      setStep(hp < 0.34 ? 0 : hp < 0.67 ? 1 : 2);
    };

    // run every frame so the box follows scroll AND keeps its idle spin (idle is disabled when reduced-motion)
    const frame = (now: number) => { place(now); raf = requestAnimationFrame(frame); };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lakonos",
    url: SITE,
    email: "rudi@lakonos.com",
    areaServed: "ZA",
    description: "Lakonos designs and builds custom business-automation systems for South African operators — replacing manual labour across warehouse, production, quality and admin.",
    makesOffer: {
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: "Custom business automation", serviceType: "Business process automation, WMS and ERP development" },
    },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="lx" ref={rootRef}>
      <Intro />
      <a className="lx-skip" href="#main">Skip to content</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* shared gradient defs */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <linearGradient id="lxg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#818CF8" /><stop offset="0.5" stopColor="#C084FC" /><stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
          <radialGradient id="lxcore" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#C4B5FD" /><stop offset="1" stopColor="#6366F1" />
          </radialGradient>
        </defs>
      </svg>

      <div className="lx-progress"><div className="lx-bar" ref={barRef} /></div>

      {/* NAV */}
      <nav className="lx-nav" ref={navRef}>
        <div className="lx-wrap lx-navrow">
          <a className="lx-logo" href="#top" aria-label="Lakonos home">L<span className="lx-wm-acc">Λ</span>KONOS</a>
          <div className="lx-links">
            <a href="#services">What we do</a>
            <a href="#sizes">Project size</a>
            <a href="#proof">Proof</a>
            <a href="#faq">FAQ</a>
            <a href="/portal/login" className="lx-login">Client login</a>
            <a href="#start" className="lx-btn lx-btn--primary lx-navcta">Get a free quote</a>
          </div>
        </div>
      </nav>

      {/* SCROLL STAGE — single morphing visual */}
      <section className="lx-stage-wrap" ref={wrapRef} id="top">
        <div className="lx-stage">
          <div className="lx-aurora-wrap" ref={auroraRef} aria-hidden="true"><div className="lx-aurora" /></div>
          <ShaderField />
          <div className="lx-gridbg" aria-hidden="true" />

          <div className="lx-cube-wrap" aria-hidden="true">
            <div className="lx-cube">
              <div className="lx-face f1" /><div className="lx-face f2" /><div className="lx-face f3" />
              <div className="lx-face f4" /><div className="lx-face f5" /><div className="lx-face f6" />
            </div>
            <div className="lx-orbit"><i /><i /><i /></div>
            <div className="lx-cube-core" />
          </div>

          <div className="lx-vis-wrap" ref={visRef} aria-hidden="true">
            <svg className="lx-vis" viewBox="0 0 600 360">
              <circle className="lx-ring" cx="300" cy="180" r="120" style={{ opacity: 0 }} />
              <g>
                {EDGES.map((_, i) => (<line className="lx-edge" key={i} x1="0" y1="0" x2="0" y2="0" style={{ opacity: 0 }} />))}
              </g>
              <circle className="lx-halo" cx="300" cy="180" r="46" style={{ opacity: 0 }} />
              <circle className="lx-core" cx="300" cy="180" r="20" style={{ opacity: 0 }} />
              {SCATTER.map(([x, y], i) => (<circle className="lx-node" key={i} cx={x} cy={y} r="6" style={{ fillOpacity: 0.45 }} />))}
            </svg>
          </div>

          <div className="lx-caps">
            {CAPS.map((c, i) => (
              <div className="lx-cap" key={i} data-on={i === 0 ? "true" : "false"} style={{ opacity: i === 0 ? 1 : 0 }}>
                {i === 0
                  ? <h1><Split text={c.h} /></h1>
                  : <h2><Split text={c.h} /></h2>}
                <p>{c.p}</p>
              </div>
            ))}
          </div>

          <div className="lx-prog" aria-hidden="true">
            <span className="lx-progdot on" /><span className="lx-progdot" /><span className="lx-progdot" />
          </div>

          <div className="lx-hint" ref={hintRef} aria-hidden="true">
            <span>Scroll</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
          </div>
        </div>
      </section>

      {/* INTRO + STATS */}
      <section className="lx-section lx-intro" id="main">
        <div className="lx-wrap lx-reveal" style={{ textAlign: "center" }}>
          <div className="lx-eyebrow lx-center">Custom business automation · South Africa</div>
          <h2 className="lx-h2 lx-center">Automate the work your people do <span className="lx-grad">by hand.</span></h2>
          <p className="lx-lead lx-center">Lakonos designs and builds a system around how your business already runs — and lets it do the work of an entire team. If it’s manual and repetitive, we automate it.</p>
          <div className="lx-actions lx-center" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
            <a href="#start" className="lx-btn lx-btn--primary">Get a free quote</a>
            <a href="#proof" className="lx-btn lx-btn--ghost">View the proof</a>
          </div>
          <p className="lx-trust lx-center">Free · No obligation · Reply within one business day</p>
        </div>

        <div className="lx-wrap lx-stats lx-reveal">
          {STATS.map((s, i) => (
            <div className="lx-stat" key={i}>
              <div className="lx-num lx-grad">{s.n}</div>
              <div className="lx-lbl">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE AUTOMATE */}
      <section className="lx-section lx-cvauto" id="services">
        <div className="lx-wrap">
          <div className="lx-reveal">
            <div className="lx-eyebrow">What we automate</div>
            <h2 className="lx-h2">If your team does it by hand, we can automate it.</h2>
          </div>
          <div className="lx-cards">
            {MODULES.map((m, i) => (
              <div className="lx-card lx-reveal" key={i} style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <div className="lx-ic"><Icon name={m.icon} /></div>
                <h3>{m.t}</h3>
                <p>{m.d}</p>
              </div>
            ))}
          </div>
          <p className="lx-note lx-reveal">Warehouse is just where most businesses start. <b>Whatever your team repeats by hand, it can run by itself.</b></p>
        </div>
      </section>

      {/* PROJECT SIZE */}
      <section className="lx-section lx-cvauto" id="sizes">
        <div className="lx-wrap">
          <div className="lx-reveal">
            <div className="lx-eyebrow">No job too small or too big</div>
            <h2 className="lx-h2">From a single manual task to your whole operation.</h2>
            <p className="lx-lead">Start wherever it hurts most. We scope the work, give you a fixed price, and you decide how far to take it — one task today, the whole floor when you’re ready.</p>
          </div>
          <div className="lx-tiers">
            {TIERS.map((t, i) => (
              <div className={`lx-tier lx-reveal${t.feat ? " feat" : ""}`} key={i} style={{ transitionDelay: `${i * 80}ms` }}>
                {t.feat && <div className="lx-badge">Most common</div>}
                <span className="lx-tag">{t.tag}</span>
                <h3>{t.t}</h3>
                <p>{t.d}</p>
                <div className="lx-eg">{t.eg}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="lx-section lx-cvauto" id="proof">
        <div className="lx-wrap">
          <div className="lx-proof lx-reveal">
            <div className="lx-eyebrow">Proof — this is not a prototype</div>
            <h2 className="lx-h2">It already does the work of an entire team.</h2>
            <p className="lx-attr">Built on the system that runs a high-volume supplement manufacturer in the Eastern Cape.</p>
            <div className="lx-pgrid">
              {STATS.map((s, i) => (
                <div className="lx-pstat" key={i}><div className="lx-pnum lx-grad">{s.n}</div><div className="lx-lbl">{s.l}</div></div>
              ))}
            </div>
            <p className="lx-pnote">Replaced a full third-party 3PL system — entirely.</p>
            <a href="/case-study" className="lx-btn lx-btn--ghost">Read the full case study</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL  (swap the quote/attribution for the real client words) */}
      <section className="lx-section lx-tsec lx-cvauto">
        <div className="lx-wrap">
          <blockquote className="lx-quote lx-reveal">
            <p>We went from chasing paperwork across the floor to watching it run itself. Same team, far more out the door — and the mistakes basically stopped.</p>
            <cite>Operations lead · Eastern Cape supplement manufacturer</cite>
          </blockquote>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lx-section lx-cvauto" id="how">
        <div className="lx-wrap">
          <div className="lx-reveal">
            <div className="lx-eyebrow">How it works</div>
            <h2 className="lx-h2">Tell us what’s manual. Get a fixed quote. We build it.</h2>
          </div>
          <div className="lx-steps">
            {STEPS.map((s, i) => (
              <div className="lx-step lx-reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="lx-k">{s.k}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lx-section lx-cvauto" id="faq">
        <div className="lx-wrap">
          <div className="lx-reveal">
            <div className="lx-eyebrow">Questions</div>
            <h2 className="lx-h2">The things operators usually ask.</h2>
          </div>
          <div className="lx-faq lx-reveal">
            {FAQ.map((f, i) => (
              <details className="lx-q" key={i} {...(i === 0 ? { open: true } : {})}>
                <summary>{f.q}<span className="lx-qicon" aria-hidden="true" /></summary>
                <div className="lx-qa"><p>{f.a}</p></div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + LEAD FORM */}
      <section className="lx-section" id="start">
        <div className="lx-wrap">
          <div className="lx-cta lx-reveal">
            <div className="lx-eyebrow lx-center">Start here</div>
            <h2 className="lx-h2 lx-center">Get your free quote</h2>
            <p className="lx-lead lx-center">Tell us what your team does by hand. Leave your details and we’ll come back with what we’d automate — and what it would cost.</p>
            <LeadForm />
            <p className="lx-trust lx-center">Free · No obligation · Reply within one business day</p>
            <a className="lx-email" href="mailto:rudi@lakonos.com">rudi@lakonos.com</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lx-footer">
        <div className="lx-wrap lx-footrow">
          <div className="lx-footbrand">
            <a className="lx-logo" href="#top" aria-label="Lakonos home">L<span className="lx-wm-acc">Λ</span>KONOS</a>
            <p>Custom business automation for South African operators. One system, your whole operation — built from scratch to fit how you already work.</p>
          </div>
          <div className="lx-footcols">
            <div>
              <h4>Explore</h4>
              <a href="#services">What we automate</a><a href="#sizes">Project size</a><a href="#proof">Proof</a><a href="#faq">FAQ</a><a href="/case-study">Case study</a>
            </div>
            <div>
              <h4>Account</h4>
              <a href="#start">Get a free quote</a><a href="/portal/login">Client login</a><a href="/admin/login">Staff login</a>
            </div>
            <div>
              <h4>Contact</h4>
              <a href="mailto:rudi@lakonos.com">rudi@lakonos.com</a><span className="lx-muted">South Africa</span>
            </div>
          </div>
        </div>
        <div className="lx-wrap lx-footbottom">
          <small>© 2026 Lakonos · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></small>
        </div>
      </footer>

      {/* FLOATING WHATSAPP */}
      <a className="lx-wa" href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG)}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with Lakonos on WhatsApp" onClick={() => (window as unknown as { va?: (e: string, p?: unknown) => void }).va?.("event", { name: "whatsapp_click" })}>
        <svg viewBox="0 0 32 32" width="27" height="27" fill="#fff" aria-hidden="true"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.9 1 1-4.8-.2-.4C5.5 18.4 5 16.7 5 15 5 9 9.9 4 16 4s11 5 11 11-4.9 10.8-11 10.8zm6.1-7.8c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.7.1-.1.3-.4.5-.6.1-.2.2-.3.3-.6.1-.2 0-.4 0-.6-.1-.2-.8-1.9-1.1-2.6-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.3z" /></svg>
      </a>

      <Interactions />

      {/* ===================== SCOPED STYLES (styled-jsx, .lx-prefixed) ===================== */}
      <style jsx global>{`
        body { background: #06060c; }

        /* CRITICAL for the pinned hero: a parent with overflow-x:hidden silently turns
           into a scroll container and breaks position:sticky. clip clips horizontally
           WITHOUT creating a scroll container. !important beats whatever globals.css sets. */
        html, body { overflow-x: clip !important; }

        /* Lenis smooth-scroll classes (only present while this page is mounted) */
        html.lenis, html.lenis body { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        .lenis.lenis-stopped { overflow: hidden; }

        .lx {
          --ink:#06060c; --ink-2:#0c0c16;
          --surface:rgba(255,255,255,.045); --surface-2:rgba(255,255,255,.07);
          --border:rgba(255,255,255,.09); --border-2:rgba(255,255,255,.16);
          --text:#f4f4f8; --muted:#a2a2b8; --muted-2:#9a9ab4;
          --grad:linear-gradient(115deg,#818cf8 0%,#c084fc 48%,#22d3ee 100%);
          --disp: var(--font-display), 'Sora', system-ui, -apple-system, sans-serif;
          --body: var(--font-body), 'Hanken Grotesk', system-ui, -apple-system, sans-serif;
          background: var(--ink); color: var(--text); font-family: var(--body); line-height: 1.6; overflow-x: clip;
        }
        .lx *, .lx *::before, .lx *::after { box-sizing: border-box; }
        .lx a { color: inherit; text-decoration: none; }
        .lx .lx-wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
        .lx .lx-grad { background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .lx .lx-center { margin-left: auto; margin-right: auto; }
        .lx a:focus-visible, .lx button:focus-visible, .lx input:focus-visible, .lx textarea:focus-visible, .lx summary:focus-visible { outline: 2px solid #a5b4fc; outline-offset: 3px; border-radius: 6px; }

        .lx .lx-progress { position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 60; background: rgba(255,255,255,.06); }
        .lx .lx-bar { height: 100%; transform: scaleX(0); transform-origin: 0 50%; background: var(--grad); }

        /* nav */
        .lx .lx-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 50; transition: background .3s ease, backdrop-filter .3s ease, border-color .3s ease; border-bottom: 1px solid transparent; }
        .lx .lx-nav.solid { background: rgba(8,8,16,.72); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom-color: var(--border); }
        .lx .lx-navrow { display: flex; align-items: center; justify-content: space-between; height: 70px; }
        .lx .lx-logo { font-family: var(--disp); font-weight: 700; font-size: 21px; letter-spacing: 1px; color: var(--text); display: inline-block; }
        .lx .lx-wm-acc { background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .lx .lx-links { display: flex; align-items: center; gap: 26px; }
        .lx .lx-links a:not(.lx-btn) { color: var(--muted); font-size: 14.5px; transition: color .15s; }
        .lx .lx-links a:not(.lx-btn):hover { color: var(--text); }
        .lx .lx-login { color: #c4b5fd !important; }

        /* buttons */
        .lx .lx-btn { display: inline-flex; align-items: center; justify-content: center; font-family: var(--disp); font-weight: 600; font-size: 15px; letter-spacing: -.2px; padding: 13px 24px; border-radius: 12px; cursor: pointer; border: 1px solid transparent; transition: transform .18s ease, box-shadow .25s ease, background .2s ease, border-color .2s ease; }
        .lx .lx-btn--primary { color: #0a0a12; background: linear-gradient(115deg,#a5b4fc,#d8b4fe 50%,#67e8f9); box-shadow: 0 10px 36px -12px rgba(139,92,246,.7); }
        .lx .lx-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 16px 44px -12px rgba(139,92,246,.85); }
        .lx .lx-btn--ghost { color: var(--text); background: var(--surface); border-color: var(--border-2); backdrop-filter: blur(8px); }
        .lx .lx-btn--ghost:hover { transform: translateY(-2px); background: var(--surface-2); }
        .lx .lx-navcta { padding: 10px 18px; font-size: 14px; }

        /* typography helpers */
        .lx .lx-eyebrow { font-family: var(--disp); font-weight: 500; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: #9b8cf0; display: inline-flex; align-items: center; gap: 10px; margin-bottom: 18px; }
        .lx .lx-eyebrow::before { content: ""; width: 22px; height: 1px; background: linear-gradient(90deg,#8b5cf6,transparent); }
        .lx .lx-eyebrow.lx-center { justify-content: center; }
        .lx .lx-h2 { font-family: var(--disp); font-weight: 600; font-size: clamp(28px,4.4vw,52px); line-height: 1.05; letter-spacing: -1.4px; max-width: 20ch; }
        .lx .lx-lead { font-size: clamp(16px,2vw,19px); color: var(--muted); max-width: 60ch; margin-top: 18px; }
        .lx .lx-trust { font-family: var(--disp); font-size: 13px; letter-spacing: .3px; color: var(--muted-2); margin-top: 18px; }

        /* ===== STAGE (single morphing visual) ===== */
        .lx .lx-stage-wrap { position: relative; height: 300vh; }
        .lx .lx-stage { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; }
        .lx .lx-aurora-wrap { position: absolute; inset: 0; pointer-events: none; will-change: transform; }
        .lx .lx-aurora { position: absolute; inset: -25%; filter: blur(34px); opacity: .9;
          background: radial-gradient(38% 38% at 28% 30%, rgba(99,102,241,.40), transparent 62%), radial-gradient(40% 40% at 72% 38%, rgba(168,85,247,.34), transparent 62%), radial-gradient(46% 46% at 50% 78%, rgba(34,211,238,.22), transparent 64%);
          animation: lxDrift 20s ease-in-out infinite alternate; }
        .lx .lx-gridbg { position: absolute; inset: 0; pointer-events: none; opacity: .5; background-image: radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px); background-size: 34px 34px; -webkit-mask: radial-gradient(circle at 50% 42%, #000 28%, transparent 74%); mask: radial-gradient(circle at 50% 42%, #000 28%, transparent 74%); }
        .lx .lx-vis-wrap { display: none; }
        .lx .lx-vis { width: min(640px,88vw); height: auto; overflow: visible; animation: lxFloat 8s ease-in-out infinite; }
        .lx .lx-node { fill: url(#lxg); }
        .lx .lx-edge { stroke: url(#lxg); stroke-width: 1.4; }
        .lx .lx-ring { fill: none; stroke: url(#lxg); stroke-width: 1.4; }
        .lx .lx-core { fill: url(#lxcore); animation: lxPulse 3.4s ease-in-out infinite; }
        .lx .lx-halo { fill: url(#lxcore); animation: lxPulse 3.4s ease-in-out infinite; }

        /* ---- hero 3D box: the single object that assembles + comes alive on scroll ---- */
        .lx .lx-cube-wrap { position: fixed; left: 0; top: 0; width: 220px; height: 220px; transform: translate(50vw,42vh) translate(-50%,-50%); perspective: 1000px; z-index: 40; pointer-events: none; will-change: transform;
          --assemble: 0; --live: 0; --half: 110px; --explode: 175px; --orbitR: 156px; }
        .lx .lx-cube { position: absolute; inset: 0; transform-style: preserve-3d; transform: rotateX(-18deg) rotateY(0deg); }
        .lx .lx-face { position: absolute; width: 220px; height: 220px; border-radius: 16px; opacity: calc(.14 + var(--assemble) * .86); will-change: transform, opacity;
          background: linear-gradient(135deg, rgba(129,140,248,.16), rgba(34,211,238,.05));
          box-shadow: inset 0 0 0 1px rgba(165,180,252,.42), 0 0 60px rgba(139,92,246,.12); }
        .lx .lx-face.f1 { transform: translateZ(calc(var(--half) + (1 - var(--assemble)) * var(--explode))); }
        .lx .lx-face.f2 { transform: rotateY(180deg) translateZ(calc(var(--half) + (1 - var(--assemble)) * var(--explode))); }
        .lx .lx-face.f3 { transform: rotateY(90deg) translateZ(calc(var(--half) + (1 - var(--assemble)) * var(--explode))); }
        .lx .lx-face.f4 { transform: rotateY(-90deg) translateZ(calc(var(--half) + (1 - var(--assemble)) * var(--explode))); }
        .lx .lx-face.f5 { transform: rotateX(90deg) translateZ(calc(var(--half) + (1 - var(--assemble)) * var(--explode))); }
        .lx .lx-face.f6 { transform: rotateX(-90deg) translateZ(calc(var(--half) + (1 - var(--assemble)) * var(--explode))); }
        .lx .lx-cube-core { position: absolute; left: 50%; top: 50%; width: 96px; height: 96px; border-radius: 50%; filter: blur(2px); opacity: var(--live);
          background: radial-gradient(circle, rgba(216,180,254,.95), rgba(34,211,238,.4) 58%, transparent 72%);
          transform: translate(-50%,-50%) scale(calc(.5 + var(--live) * .6)); }
        .lx .lx-orbit { position: absolute; inset: -44px; opacity: var(--live); animation: lxSpin 14s linear infinite; }
        .lx .lx-orbit i { position: absolute; top: 50%; left: 50%; width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(120deg,#a5b4fc,#67e8f9); box-shadow: 0 0 14px rgba(103,232,249,.85); }
        .lx .lx-orbit i:nth-child(1) { transform: translate(-50%,-50%) rotate(0deg) translateX(var(--orbitR)); }
        .lx .lx-orbit i:nth-child(2) { transform: translate(-50%,-50%) rotate(120deg) translateX(var(--orbitR)); }
        .lx .lx-orbit i:nth-child(3) { transform: translate(-50%,-50%) rotate(240deg) translateX(var(--orbitR)); }
        @keyframes lxSpin { to { transform: rotate(360deg); } }
        .lx .lx-prog { position: absolute; left: 50%; bottom: 11vh; transform: translateX(-50%); display: flex; gap: 9px; z-index: 3; }
        .lx .lx-progdot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.22); transition: width .3s ease, background .3s ease, border-radius .3s ease; }
        .lx .lx-progdot.on { width: 22px; border-radius: 4px; background: var(--grad); }

        .lx .lx-caps { position: absolute; inset: 0; display: grid; place-items: end center; padding: 0 24px 19vh; }
        .lx .lx-caps::before { content: ""; grid-area: 1/1; width: min(780px,94vw); height: 320px; background: radial-gradient(closest-side, rgba(6,6,12,.7), transparent 75%); }
        .lx .lx-cap { grid-area: 1/1; max-width: min(720px,92vw); text-align: center; will-change: opacity, transform; }
        .lx .lx-cap h1, .lx .lx-cap h2 { font-family: var(--disp); font-weight: 600; font-size: clamp(30px,5.6vw,66px); line-height: 1.02; letter-spacing: -1.8px; margin: 0; }
        .lx .lx-cap p { color: var(--muted); font-size: clamp(15px,2vw,19px); max-width: 48ch; margin: 16px auto 0; }
        .lx .lx-word { display: inline-block; margin-right: .24em; }
        .lx .lx-ch { display: inline-block; opacity: 0; transform: translateY(16px); transition: opacity .5s ease, transform .5s cubic-bezier(.2,.7,.2,1); transition-delay: calc(var(--i) * 26ms); }
        .lx .lx-cap[data-on="true"] .lx-ch { opacity: 1; transform: none; }
        .lx.reduced .lx-ch { opacity: 1 !important; transform: none !important; transition: none !important; }

        .lx .lx-hint { position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--muted-2); font-family: var(--disp); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; transition: opacity .4s ease; }
        .lx .lx-hint svg { animation: lxBob 1.8s ease-in-out infinite; }

        /* ===== content sections ===== */
        .lx .lx-section { position: relative; padding: clamp(84px,12vh,150px) 0; scroll-margin-top: 80px; border-top: 1px solid var(--border); }
        .lx .lx-cvauto { content-visibility: visible; }
        .lx .lx-skip { position: fixed; top: -60px; left: 16px; z-index: 90; background: var(--ink-2); border: 1px solid var(--border-2); color: var(--text); font-family: var(--disp); font-size: 14px; padding: 10px 16px; border-radius: 10px; transition: top .2s ease; }
        .lx .lx-skip:focus { top: 16px; }
        .lx .lx-intro { padding-top: clamp(70px,9vh,120px); }
        .lx .lx-reveal { opacity: 0; transform: translateY(30px); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); will-change: opacity, transform; }
        .lx .lx-reveal.in { opacity: 1; transform: none; }

        .lx .lx-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; margin-top: 64px; background: var(--border); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; }
        .lx .lx-stat { background: var(--ink-2); padding: 30px 22px; }
        .lx .lx-num { font-family: var(--disp); font-weight: 600; font-size: clamp(28px,4vw,46px); line-height: 1; letter-spacing: -1px; font-variant-numeric: tabular-nums; }
        .lx .lx-lbl { font-size: 13px; letter-spacing: .4px; color: var(--muted); margin-top: 12px; }

        .lx .lx-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 50px; }
        .lx .lx-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 28px 26px; backdrop-filter: blur(10px); transition: transform .25s ease, border-color .25s ease, background .25s ease; }
        .lx .lx-card.in:hover { transform: translateY(-5px); border-color: var(--border-2); background: var(--surface-2); }
        .lx .lx-ic { width: 50px; height: 50px; display: grid; place-items: center; border-radius: 14px; background: rgba(139,92,246,.12); border: 1px solid var(--border); margin-bottom: 18px; }
        .lx .lx-card h3 { font-family: var(--disp); font-weight: 600; font-size: 19px; letter-spacing: -.4px; }
        .lx .lx-card p { color: var(--muted); font-size: 15px; margin-top: 8px; }
        .lx .lx-note { margin-top: 30px; color: var(--muted); font-size: 16px; max-width: 60ch; }
        .lx .lx-note b { color: var(--text); font-weight: 500; }

        .lx .lx-tiers { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 50px; }
        .lx .lx-tier { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 30px 26px; backdrop-filter: blur(10px); display: flex; flex-direction: column; gap: 10px; }
        .lx .lx-tier.feat { background: var(--ink-2); box-shadow: 0 24px 70px -30px rgba(139,92,246,.6); }
        .lx .lx-tier.feat::before { content: ""; position: absolute; inset: 0; border-radius: 20px; padding: 1px; background: var(--grad); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .lx .lx-badge { position: absolute; top: -11px; left: 26px; font-family: var(--disp); font-weight: 500; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #0a0a12; background: linear-gradient(115deg,#a5b4fc,#d8b4fe); padding: 4px 12px; border-radius: 99px; }
        .lx .lx-tag { align-self: flex-start; font-family: var(--disp); font-weight: 500; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #c4b5fd; border: 1px solid var(--border-2); border-radius: 99px; padding: 4px 12px; }
        .lx .lx-tier h3 { font-family: var(--disp); font-weight: 600; font-size: 22px; letter-spacing: -.5px; margin-top: 4px; }
        .lx .lx-tier p { color: var(--muted); font-size: 15px; }
        .lx .lx-eg { font-family: var(--disp); font-size: 13px; color: var(--muted-2); margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border); }

        .lx .lx-proof { position: relative; background: var(--ink-2); border: 1px solid var(--border); border-radius: 26px; padding: clamp(34px,5vw,60px); overflow: hidden; }
        .lx .lx-proof::after { content: ""; position: absolute; top: -40%; right: -10%; width: 60%; height: 120%; pointer-events: none; background: radial-gradient(circle, rgba(139,92,246,.22), transparent 65%); filter: blur(30px); }
        .lx .lx-attr { color: var(--muted); font-size: 15px; margin-top: 16px; position: relative; }
        .lx .lx-pgrid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-top: 40px; position: relative; }
        .lx .lx-pnum { font-family: var(--disp); font-weight: 600; font-size: clamp(30px,4.6vw,54px); line-height: 1; letter-spacing: -1px; font-variant-numeric: tabular-nums; }
        .lx .lx-pnote { position: relative; margin-top: 30px; font-family: var(--disp); font-weight: 500; font-size: clamp(17px,2.2vw,22px); color: var(--text); }
        .lx .lx-proof .lx-btn { position: relative; margin-top: 26px; }

        /* testimonial */
        .lx .lx-tsec { padding-top: clamp(40px,6vh,70px); }
        .lx .lx-quote { position: relative; max-width: 900px; margin: 0 auto; text-align: center; padding: 8px 0; }
        .lx .lx-quote::before { content: "“"; display: block; font-family: var(--disp); font-weight: 700; font-size: 90px; line-height: .6; background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 10px; }
        .lx .lx-quote p { font-family: var(--disp); font-weight: 500; font-size: clamp(20px,3vw,32px); line-height: 1.3; letter-spacing: -.6px; color: var(--text); }
        .lx .lx-quote cite { display: block; margin-top: 22px; font-style: normal; font-size: 14px; letter-spacing: .4px; color: var(--muted); }

        /* steps */
        .lx .lx-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 50px; }
        .lx .lx-step { border-top: 1px solid var(--border); padding-top: 22px; }
        .lx .lx-k { font-family: var(--disp); font-weight: 600; font-size: 15px; letter-spacing: 1px; color: transparent; background: var(--grad); -webkit-background-clip: text; background-clip: text; }
        .lx .lx-step h3 { font-family: var(--disp); font-weight: 600; font-size: 19px; letter-spacing: -.4px; margin: 12px 0 8px; }
        .lx .lx-step p { color: var(--muted); font-size: 15px; }

        /* FAQ */
        .lx .lx-faq { margin-top: 44px; border-top: 1px solid var(--border); }
        .lx .lx-q { border-bottom: 1px solid var(--border); }
        .lx .lx-q summary { list-style: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 22px 4px; font-family: var(--disp); font-weight: 500; font-size: clamp(16px,2vw,20px); letter-spacing: -.3px; color: var(--text); }
        .lx .lx-q summary::-webkit-details-marker { display: none; }
        .lx .lx-qicon { position: relative; flex: none; width: 18px; height: 18px; }
        .lx .lx-qicon::before, .lx .lx-qicon::after { content: ""; position: absolute; background: #c4b5fd; transition: transform .25s ease, opacity .25s ease; }
        .lx .lx-qicon::before { top: 8px; left: 0; width: 18px; height: 2px; }
        .lx .lx-qicon::after { left: 8px; top: 0; width: 2px; height: 18px; }
        .lx .lx-q[open] .lx-qicon::after { transform: rotate(90deg); opacity: 0; }
        .lx .lx-qa { overflow: hidden; }
        .lx .lx-qa p { color: var(--muted); font-size: 15.5px; line-height: 1.65; max-width: 70ch; padding: 0 4px 22px; }

        /* cta */
        .lx .lx-cta { position: relative; text-align: center; background: var(--ink-2); border: 1px solid var(--border); border-radius: 28px; padding: clamp(44px,6vw,80px) clamp(24px,5vw,60px); overflow: hidden; }
        .lx .lx-cta::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(60% 80% at 50% 0%, rgba(139,92,246,.22), transparent 70%); }
        .lx .lx-cta > * { position: relative; }
        .lx .lx-cta .lx-h2 { font-size: clamp(32px,5.2vw,58px); }
        .lx .lx-email { display: block; margin-top: 22px; font-family: var(--disp); font-size: 15px; color: #c4b5fd; }
        .lx .lx-email:hover { color: #ddd6fe; }

        /* lead form */
        .lx .lead-form { max-width: 540px; margin: 32px auto 0; text-align: left; display: grid; gap: 14px; }
        .lx .lead-form .row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .lx .lead-form input, .lx .lead-form textarea { width: 100%; font-family: var(--body); font-size: 15px; color: var(--text); background: rgba(255,255,255,.04); border: 1px solid var(--border-2); border-radius: 12px; padding: 14px 16px; transition: border-color .2s ease, background .2s ease; }
        .lx .lead-form input::placeholder, .lx .lead-form textarea::placeholder { color: var(--muted-2); }
        .lx .lead-form input:focus, .lx .lead-form textarea:focus { border-color: #a5b4fc; background: rgba(255,255,255,.06); }
        .lx .lead-form textarea { min-height: 116px; resize: vertical; }
        .lx .lead-form button { width: 100%; font-family: var(--disp); font-weight: 600; font-size: 15px; color: #0a0a12; background: linear-gradient(115deg,#a5b4fc,#d8b4fe 50%,#67e8f9); border: none; border-radius: 12px; padding: 15px; cursor: pointer; box-shadow: 0 10px 36px -12px rgba(139,92,246,.7); transition: transform .18s ease; }
        .lx .lead-form button:hover { transform: translateY(-2px); }
        .lx .form-msg { font-size: 14px; }
        .lx .form-msg.ok { color: #67e8f9; }
        .lx .form-msg.err { color: #fda4af; }

        /* footer */
        .lx .lx-footer { border-top: 1px solid var(--border); padding: 60px 0 32px; }
        .lx .lx-footrow { display: grid; grid-template-columns: 1.6fr 2fr; gap: 40px; }
        .lx .lx-footbrand p { color: var(--muted); font-size: 14px; margin-top: 14px; max-width: 340px; }
        .lx .lx-footcols { display: grid; grid-template-columns: repeat(3,1fr); gap: 28px; }
        .lx .lx-footcols h4 { font-family: var(--disp); font-weight: 600; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: var(--text); margin-bottom: 14px; }
        .lx .lx-footcols a { display: block; color: var(--muted); font-size: 14px; margin-bottom: 10px; transition: color .15s; }
        .lx .lx-footcols a:hover { color: #c4b5fd; }
        .lx .lx-muted { color: var(--muted-2); font-size: 13px; }
        .lx .lx-footbottom { border-top: 1px solid var(--border); margin-top: 44px; padding-top: 24px; text-align: center; }
        .lx .lx-footbottom small { color: var(--muted-2); font-size: 13px; }
        .lx .lx-footbottom a { color: var(--muted); }
        .lx .lx-footbottom a:hover { color: #c4b5fd; }

        /* floating whatsapp */
        .lx .lx-wa { position: fixed; right: 20px; bottom: 20px; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: grid; place-items: center; z-index: 80; box-shadow: 0 12px 30px -8px rgba(37,211,102,.6); transition: transform .18s ease; }
        .lx .lx-wa:hover { transform: scale(1.08); }
        .lx .lx-wa::after { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(37,211,102,.5); animation: lxPing 2.4s ease-out infinite; }

        /* keyframes */
        @keyframes lxDrift { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(-4%,3%) scale(1.08); } }
        @keyframes lxFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes lxPulse { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
        @keyframes lxBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
        @keyframes lxPing { 0% { transform: scale(1); opacity: .7; } 80%,100% { transform: scale(1.7); opacity: 0; } }

        /* responsive */
        @media (max-width: 900px) {
          .lx .lx-cards, .lx .lx-tiers, .lx .lx-steps { grid-template-columns: 1fr 1fr; }
          .lx .lx-footrow { grid-template-columns: 1fr; gap: 30px; }
        }
        @media (max-width: 640px) {
          .lx .lx-navcta { display: none; }
          .lx .lx-links { gap: 0; }
          .lx .lx-links a:not(.lx-login):not(.lx-btn) { display: none; }
          .lx .lx-stage-wrap { height: 230vh; }
          .lx .lx-caps { padding: 0 22px 15vh; }
          .lx .lx-cube-wrap { width: 150px; height: 150px; --half: 75px; --explode: 120px; --orbitR: 112px; }
          .lx .lx-face { width: 150px; height: 150px; }
          .lx .lx-prog { bottom: 9vh; }
          .lx .lx-stats, .lx .lx-pgrid { grid-template-columns: 1fr 1fr; }
          .lx .lx-cards, .lx .lx-tiers, .lx .lx-steps { grid-template-columns: 1fr; }
          .lx .lx-footcols { grid-template-columns: 1fr 1fr; }
          .lx .lead-form .row { grid-template-columns: 1fr; }
          .lx .lx-aurora { filter: blur(22px); }  /* lighter blur = smoother on phones */
        }

        /* reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .lx .lx-aurora, .lx .lx-vis, .lx .lx-core, .lx .lx-halo, .lx .lx-hint svg, .lx .lx-wa::after { animation: none !important; }
          .lx .lx-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}