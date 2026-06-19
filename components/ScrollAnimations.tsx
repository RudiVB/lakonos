"use client";

import { useEffect } from "react";

// Mounted once in the root layout. Adds premium motion to marketing/case-study
// pages by selecting existing elements — no markup changes required.
// Fully respects prefers-reduced-motion (skips all animation).
export default function ScrollAnimations() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // marketing nav background-blur once scrolled (ignore the admin tab bar)
    const nav = document.querySelector<HTMLElement>(".site-nav");
    const onScroll = () => {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (reduce) {
      return () => window.removeEventListener("scroll", onScroll);
    }

    document.documentElement.classList.add("anim");

    // ---- reveal on scroll ----
    const revealSelectors = [
      ".hero .wrap > *",
      ".block .wrap > .eyebrow",
      ".block .wrap > .head",
      ".block .wrap > .lede",
      ".block .wrap > .attribution",
      ".block .wrap > .modules-note",
      ".block .wrap > .proof-note",
      ".contrast > *",
      ".modules > *",
      ".steps > *",
      ".ledger > *",
      ".proof-grid > *",
      ".cta .wrap > *",
      ".cs-reveal",
    ];
    const targets = Array.from(document.querySelectorAll<HTMLElement>(revealSelectors.join(",")));
    targets.forEach((el) => el.classList.add("reveal-target"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    // stagger siblings within the same parent
    const counts = new Map<Element, number>();
    targets.forEach((el) => {
      const p = el.parentElement as Element;
      const i = counts.get(p) ?? 0;
      counts.set(p, i + 1);
      el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
      io.observe(el);
    });

    // ---- count-up numbers ----
    const nums = Array.from(document.querySelectorAll<HTMLElement>(".ledger .num, .proof-grid .num, .cs-num"));

    const parse = (txt: string) => {
      // skip ranges like "40→24"
      if (/\d\s*[→\-–]\s*\d/.test(txt)) return null;
      const m = txt.match(/^([^\d]*)([\d,.\s]+)(.*)$/);
      if (!m) return null;
      const raw = m[2].replace(/[,\s]/g, "");
      const num = parseFloat(raw);
      if (isNaN(num)) return null;
      return {
        prefix: m[1],
        num,
        suffix: m[3],
        decimals: (raw.split(".")[1] || "").length,
        hadComma: /,/.test(m[2]),
      };
    };

    const fmt = (v: number, decimals: number, hadComma: boolean) => {
      if (hadComma) return Math.round(v).toLocaleString("en-ZA");
      return v.toFixed(decimals);
    };

    const numIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          numIo.unobserve(el);
          const original = el.textContent || "";
          const p = parse(original);
          if (!p) return;
          const dur = 1100;
          const t0 = performance.now();
          const step = (now: number) => {
            const t = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = p.prefix + fmt(p.num * eased, p.decimals, p.hadComma) + p.suffix;
            if (t < 1) requestAnimationFrame(step);
            else el.textContent = original; // restore exact original formatting
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach((el) => numIo.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      numIo.disconnect();
    };
  }, []);

  return null;
}
