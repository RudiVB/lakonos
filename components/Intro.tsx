"use client";

import { useEffect, useState } from "react";

/* =====================================================================
   Intro — one-time cinematic reveal using the real Lakonos lambda mark.
   Sequence (~1.9s): tile + lambda draw themselves (stroke trace from the
   apex) → "LΛKONOS" rises letter-by-letter (Λ in gradient) → curtain lifts.
   - Plays ONCE per tab session (sessionStorage); refresh/back won't replay.
   - Skipped on prefers-reduced-motion (hides within a frame).
   - Self-contained styled-jsx; gradient matches the site. No deps.
   ===================================================================== */

// "LΛKONOS" — index 1 is the accented Greek lambda
const LETTERS: Array<{ c: string; acc?: boolean }> = [
  { c: "L" }, { c: "Λ", acc: true }, { c: "K" }, { c: "O" }, { c: "N" }, { c: "O" }, { c: "S" },
];

export default function Intro() {
  const [show, setShow] = useState(true);     // covers immediately on first paint (no content peek)
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try { seen = !!sessionStorage.getItem("lk_intro_seen"); } catch { /* ignore */ }

    if (reduce || seen) { setShow(false); return; }
    try { sessionStorage.setItem("lk_intro_seen", "1"); } catch { /* ignore */ }

    const t1 = setTimeout(() => setExiting(true), 1700); // curtain lift
    const t2 = setTimeout(() => setShow(false), 2500);   // unmount
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!show) return null;

  return (
    <div className={`lxi${exiting ? " lxi--exit" : ""}`} aria-hidden="true">
      <div className="lxi-inner">
        <svg className="lxi-mark" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="lxiGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a5b4fc" />
              <stop offset="0.5" stopColor="#d8b4fe" />
              <stop offset="1" stopColor="#67e8f9" />
            </linearGradient>
          </defs>
          <rect className="lxi-tile" x="6" y="6" width="148" height="148" rx="32" />
          <path className="lxi-lam" d="M 80 42 L 45 124 M 80 42 L 115 124" />
        </svg>
        <div className="lxi-word">
          {LETTERS.map((l, i) => (
            <span
              key={i}
              className={l.acc ? "acc" : undefined}
              style={{ animationDelay: `${0.55 + i * 0.05}s` }}
            >{l.c}</span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .lxi {
          position: fixed; inset: 0; z-index: 100; background: #06060c;
          display: grid; place-items: center; overflow: hidden;
          transition: transform .8s cubic-bezier(.76,0,.24,1); will-change: transform;
        }
        .lxi--exit { transform: translateY(-100%); }
        .lxi::before {
          content: ""; position: absolute; width: 540px; height: 540px; border-radius: 50%;
          background: radial-gradient(circle, rgba(129,140,248,.28), transparent 60%);
          filter: blur(48px); opacity: 0; animation: lxiGlow 1.9s ease forwards;
        }
        .lxi-inner { position: relative; display: flex; flex-direction: column; align-items: center; gap: 20px; }

        .lxi-mark { width: 66px; height: 66px; }
        .lxi-tile {
          fill: #0c0c16; stroke: rgba(129,140,248,.55); stroke-width: 4;
          opacity: 0; transform-origin: center;
          animation: lxiTile .55s cubic-bezier(.2,.8,.2,1) forwards;
        }
        .lxi-lam {
          fill: none; stroke: url(#lxiGrad); stroke-width: 17; stroke-linecap: square;
          stroke-dasharray: 200; stroke-dashoffset: 200;
          animation: lxiDraw .8s cubic-bezier(.6,0,.2,1) forwards .3s;
        }

        .lxi-word {
          display: inline-flex; font-family: var(--font-display), 'Sora', system-ui, sans-serif;
          font-weight: 700; font-size: 30px; letter-spacing: 6px; color: #f4f4f8;
        }
        .lxi-word span { display: inline-block; opacity: 0; transform: translateY(16px);
          animation: lxiRise .6s cubic-bezier(.2,.8,.2,1) forwards; }
        .lxi-word .acc {
          background: linear-gradient(115deg,#a5b4fc,#d8b4fe 50%,#67e8f9);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }

        @keyframes lxiTile {
          0% { opacity: 0; transform: scale(.4) rotate(-22deg); }
          60% { opacity: 1; transform: scale(1.1) rotate(6deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
        @keyframes lxiDraw { to { stroke-dashoffset: 0; } }
        @keyframes lxiRise { to { opacity: 1; transform: translateY(0); } }
        @keyframes lxiGlow {
          0% { opacity: 0; transform: scale(.6); }
          50% { opacity: 1; }
          100% { opacity: .6; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
