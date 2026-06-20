"use client";

import { useEffect } from "react";

/* =====================================================================
   Interactions — a desktop "alive" layer for the homepage.
   - 3D pointer-tilt + moving specular glare on glass cards (.lx-card/.lx-tier)
   - Magnetic primary buttons (.lx-btn--primary)
   - Soft cursor glow that blends over everything
   Attaches to existing DOM (no markup changes). Self-injects its CSS.
   Does NOTHING on touch devices or with prefers-reduced-motion, so mobile
   and accessibility are unaffected. Vanilla — no dependencies.
   ===================================================================== */

export default function Interactions() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return; // desktop + motion-OK only

    const root = document.querySelector<HTMLElement>(".lx");
    if (!root) return;

    const cleanups: Array<() => void> = [];

    // ---- inject scoped styles once ----
    const style = document.createElement("style");
    style.setAttribute("data-lx-interactions", "");
    style.textContent = `
      .lx-cursor{position:fixed;top:0;left:0;width:24px;height:24px;border-radius:50%;
        background:radial-gradient(circle, rgba(168,85,247,.9), rgba(34,211,238,.45) 55%, transparent 72%);
        pointer-events:none;z-index:95;mix-blend-mode:screen;filter:blur(1px);opacity:0;
        transition:width .22s ease,height .22s ease,opacity .3s ease;}
      .lx-cursor.show{opacity:.85;}
      .lx-cursor.lg{width:62px;height:62px;}
      .lx-glare{position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;
        transition:opacity .25s ease;
        background:radial-gradient(220px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,.16), transparent 60%);}
    `;
    document.head.appendChild(style);
    cleanups.push(() => style.remove());

    // ---- cursor glow (follows with lag, grows over interactive elements) ----
    const cur = document.createElement("div");
    cur.className = "lx-cursor";
    document.body.appendChild(cur);
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy;
    const onMove = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; cur.classList.add("show"); };
    const onLeaveDoc = () => cur.classList.remove("show");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeaveDoc);
    let raf = requestAnimationFrame(function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    });
    cleanups.push(() => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeaveDoc);
      cur.remove();
    });

    const grow = () => cur.classList.add("lg");
    const shrink = () => cur.classList.remove("lg");
    const hot = Array.from(root.querySelectorAll<HTMLElement>("a, button, summary, .lx-card, .lx-tier"));
    hot.forEach((el) => { el.addEventListener("pointerenter", grow); el.addEventListener("pointerleave", shrink); });
    cleanups.push(() => hot.forEach((el) => { el.removeEventListener("pointerenter", grow); el.removeEventListener("pointerleave", shrink); }));

    // ---- 3D tilt + glare on glass cards ----
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".lx-card, .lx-tier"));
    cards.forEach((card) => {
      if (getComputedStyle(card).position === "static") card.style.position = "relative";
      const glare = document.createElement("div");
      glare.className = "lx-glare";
      card.appendChild(glare);

      const enter = () => { card.style.transition = "transform .12s ease"; };
      const move = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -8;  // tilt up/down (deg)
        const ry = (px - 0.5) * 8;   // tilt left/right (deg)
        card.style.transform = `perspective(820px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        glare.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        glare.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
        glare.style.opacity = "1";
      };
      const leave = () => {
        card.style.transition = "transform .5s cubic-bezier(.2,.7,.2,1)";
        card.style.transform = "perspective(820px) rotateX(0deg) rotateY(0deg)";
        glare.style.opacity = "0";
      };
      card.addEventListener("pointerenter", enter);
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        card.removeEventListener("pointerenter", enter);
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
        glare.remove();
        card.style.transform = "";
        card.style.transition = "";
      });
    });

    // ---- magnetic primary buttons ----
    const mags = Array.from(root.querySelectorAll<HTMLElement>(".lx-btn--primary"));
    mags.forEach((btn) => {
      const enter = () => { btn.style.transition = "transform .15s ease"; };
      const move = (e: PointerEvent) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${(mx * 0.25).toFixed(1)}px, ${(my * 0.35).toFixed(1)}px)`;
      };
      const leave = () => { btn.style.transition = "transform .4s cubic-bezier(.2,.7,.2,1)"; btn.style.transform = ""; };
      btn.addEventListener("pointerenter", enter);
      btn.addEventListener("pointermove", move);
      btn.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        btn.removeEventListener("pointerenter", enter);
        btn.removeEventListener("pointermove", move);
        btn.removeEventListener("pointerleave", leave);
        btn.style.transform = "";
        btn.style.transition = "";
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
