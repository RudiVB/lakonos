"use client";
import { useEffect, useRef, useState } from "react";

/**
 * MainMenu — the title screen.
 * Drop into components/MainMenu.tsx and render it as the first "screen".
 *
 * Props (all optional):
 *   onContinue   – called by "Continue Campaign"
 *   onNew        – called by "New Campaign"
 *   hasSave      – if false, Continue is hidden
 *
 * Wiring (in app/page.tsx):
 *   const [screen, setScreen] = useState<"menu"|"game">("menu");
 *   const game = useGame();
 *   if (screen === "menu") return (
 *     <MainMenu
 *       hasSave={!!game.position}
 *       onContinue={() => setScreen("game")}
 *       onNew={() => { game.reset(); setScreen("game"); }}
 *     />
 *   );
 */
export default function MainMenu({
  onContinue, onNew, hasSave = true,
}: { onContinue?: () => void; onNew?: () => void; hasSave?: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [howto, setHowto] = useState(false);

  // light parallax on pointer move (desktop only)
  useEffect(() => {
    const el = sceneRef.current; if (!el) return;
    const move = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);
      el.style.setProperty("--px", String(x));
      el.style.setProperty("--py", String(y));
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div className="mm" ref={sceneRef}>
      <style>{CSS}</style>

      {/* atmosphere */}
      <div className="mm-sky" />
      <div className="mm-glow" />
      <div className="mm-fog mm-fog1" />
      <div className="mm-fog mm-fog2" />

      {/* distant silhouette */}
      <svg className="mm-scene" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice">
        <path className="mm-far" d="M0 300 L120 270 L260 300 L420 260 L600 300 L760 268 L920 300 L1080 274 L1200 300 L1200 420 L0 420 Z" />
        {/* wrecked tank */}
        <path className="mm-mid" d="M150 330 L168 300 L250 300 L300 296 L320 330 L320 348 Q320 356 312 356 L158 356 Q150 356 150 348 Z" transform="rotate(-4 235 330)" />
        <rect className="mm-mid" x="232" y="286" width="34" height="18" rx="3" transform="rotate(-4 235 330)" />
        {/* broken trees */}
        <path className="mm-mid" d="M560 356 L556 300 L548 310 M560 320 L572 308 M560 356 L564 322" />
        <path className="mm-mid" d="M980 356 L984 290 L975 300 M984 314 L996 300" />
        <path className="mm-mid" d="M70 356 L66 312 L58 322 M66 330 L78 318" />
        {/* foreground trench lip + barbed wire */}
        <path className="mm-near" d="M0 380 L1200 380 L1200 420 L0 420 Z" />
        <path className="mm-wire" d="M0 372 L1200 372" />
        <path className="mm-wire" d="M40 372 l8 -10 m-8 10 l8 10 M160 372 l8 -10 m-8 10 l8 10 M300 372 l8 -10 m-8 10 l8 10 M460 372 l8 -10 m-8 10 l8 10 M620 372 l8 -10 m-8 10 l8 10 M780 372 l8 -10 m-8 10 l8 10 M940 372 l8 -10 m-8 10 l8 10 M1100 372 l8 -10 m-8 10 l8 10" />
      </svg>

      {/* drifting embers */}
      <div className="mm-embers">{Array.from({ length: 9 }).map((_, i) => <i key={i} style={{ left: `${8 + i * 10}%`, animationDelay: `${i * 1.3}s`, animationDuration: `${7 + (i % 4) * 2}s` }} />)}</div>

      <div className="mm-vignette" />
      <div className="mm-grain" />

      {/* content */}
      <div className="mm-content">
        <div className="mm-kicker">THE WESTERN FRONT</div>
        <h1 className="mm-title">AUTO<span>BATTLE</span></h1>
        <div className="mm-year">· 1916 ·</div>
        <div className="mm-tag">Raise regiments. Hold the line. Take the salient.</div>

        <div className="mm-menu">
          {hasSave && <button className="mm-btn mm-primary" onClick={onContinue}>▸ Continue Campaign</button>}
          <button className="mm-btn" onClick={onNew}>New Campaign</button>
          <button className="mm-btn mm-ghost" onClick={() => setHowto(true)}>How to Play</button>
        </div>
      </div>

      <div className="mm-footer">v0.2 · build in progress</div>

      {/* how to play */}
      {howto && (
        <div className="mm-modal" onClick={() => setHowto(false)}>
          <div className="mm-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mm-ph">HOW TO PLAY</div>
            <ul className="mm-list">
              <li><b>Regiments, not single soldiers.</b> Each unit is thousands of men. They take casualties in battle.</li>
              <li><b>Climb the campaign map.</b> Choose a route through five regions of the front. Each node is a new objective.</li>
              <li><b>Fight battles.</b> Deploy your line and commit troops; losses carry back to your collection.</li>
              <li><b>Keep your numbers up.</b> Spend Supplies to reinforce between fights — medics slow the bleeding. A regiment at zero is lost.</li>
              <li><b>Build combined arms.</b> Mix infantry, armour and artillery to trigger doctrine bonuses.</li>
            </ul>
            <button className="mm-btn mm-primary" style={{ width: "100%", marginTop: 6 }} onClick={() => setHowto(false)}>Understood</button>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.mm { position: relative; min-height: 100vh; width: 100%; overflow: hidden;
  font-family: 'Oswald', system-ui, sans-serif; color: #e9eef7;
  --px: 0; --py: 0; isolation: isolate; }
.mm-sky { position: absolute; inset: 0; z-index: 0;
  background: linear-gradient(180deg, #0a0f1a 0%, #111c2e 42%, #1c3146 72%, #2b4a5e 100%); }
.mm-glow { position: absolute; left: 50%; bottom: 8%; width: 120%; height: 60%; transform: translateX(-50%); z-index: 0;
  background: radial-gradient(60% 70% at 50% 100%, rgba(120,180,205,.35), rgba(120,180,205,0) 70%);
  filter: blur(6px); }
.mm-fog { position: absolute; bottom: 12%; width: 60%; height: 220px; border-radius: 50%; z-index: 1;
  background: radial-gradient(closest-side, rgba(180,200,220,.16), transparent 70%); filter: blur(24px); }
.mm-fog1 { left: -10%; animation: mmFog1 26s ease-in-out infinite; }
.mm-fog2 { right: -12%; bottom: 20%; animation: mmFog2 32s ease-in-out infinite; }
@keyframes mmFog1 { 0%,100% { transform: translateX(0); } 50% { transform: translateX(28%); } }
@keyframes mmFog2 { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-26%); } }

.mm-scene { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 56%; z-index: 1;
  transform: translate(calc(var(--px) * -14px), 0); }
.mm-far { fill: #16243a; }
.mm-mid { fill: #0e1826; stroke: #0e1826; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
.mm-near { fill: #070b12; }
.mm-wire { fill: none; stroke: #05080e; stroke-width: 2.5; stroke-linecap: round; }

.mm-embers { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.mm-embers i { position: absolute; bottom: 14%; width: 3px; height: 3px; border-radius: 99px;
  background: #f0c860; box-shadow: 0 0 6px #f0c860; opacity: 0; animation: mmEmber linear infinite; }
@keyframes mmEmber { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: .8; } 100% { transform: translateY(-340px) translateX(20px); opacity: 0; } }

.mm-vignette { position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background: radial-gradient(130% 100% at 50% 30%, transparent 45%, rgba(0,0,0,.7) 100%); }
.mm-grain { position: absolute; inset: 0; z-index: 3; pointer-events: none; opacity: .35; mix-blend-mode: overlay;
  background-image: radial-gradient(rgba(0,0,0,.3) 1px, transparent 1px); background-size: 3px 3px; }

.mm-content { position: relative; z-index: 4; display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 14vh 20px 0; transform: translate(calc(var(--px) * 8px), calc(var(--py) * 6px)); }
.mm-kicker { font-size: 12px; letter-spacing: 6px; color: #7f93b4; margin-bottom: 10px; }
.mm-title { margin: 0; font-size: clamp(46px, 11vw, 104px); font-weight: 700; letter-spacing: 6px; line-height: .92;
  text-shadow: 0 2px 30px rgba(0,0,0,.6); }
.mm-title span { color: #56b9cf; text-shadow: 0 0 36px rgba(86,185,207,.55); }
.mm-year { font-family: 'Space Grotesk', monospace; letter-spacing: 8px; color: #f0c860; margin-top: 10px; font-size: clamp(13px, 2.4vw, 17px); }
.mm-tag { color: #9fb0cc; margin-top: 14px; font-size: clamp(13px, 2.6vw, 16px); max-width: 460px; }

.mm-menu { display: flex; flex-direction: column; gap: 12px; margin-top: 38px; width: min(320px, 84vw); }
.mm-btn { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 16px; letter-spacing: 1.5px; cursor: pointer;
  padding: 14px 18px; border-radius: 11px; color: #e9eef7; background: rgba(20,30,46,.6);
  border: 1px solid rgba(150,180,225,.28); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  transition: transform .12s, filter .15s, border-color .15s; }
.mm-btn:hover { transform: translateY(-2px); filter: brightness(1.12); border-color: rgba(150,180,225,.5); }
.mm-btn:active { transform: translateY(0); }
.mm-primary { border: none; color: #06222b; font-weight: 700;
  background: linear-gradient(180deg, #74cee0, #3f9fb8); box-shadow: 0 10px 26px -10px #56b9cf, inset 0 1px 0 rgba(255,255,255,.4); }
.mm-ghost { background: transparent; border-color: rgba(150,180,225,.18); color: #9fb0cc; }

.mm-footer { position: absolute; bottom: 14px; left: 0; right: 0; text-align: center; z-index: 4;
  font-family: 'Space Grotesk', monospace; font-size: 11px; letter-spacing: 2px; color: #4f5e7a; }

.mm-modal { position: fixed; inset: 0; z-index: 20; display: flex; align-items: center; justify-content: center;
  background: rgba(4,8,14,.7); backdrop-filter: blur(4px); padding: 20px; animation: mmIn .2s ease; }
.mm-panel { width: min(460px, 100%); background: linear-gradient(180deg, rgba(24,34,52,.96), rgba(14,20,30,.96));
  border: 1px solid rgba(150,180,225,.22); border-radius: 16px; padding: 22px; box-shadow: 0 30px 60px -20px #000; }
.mm-ph { font-size: 14px; letter-spacing: 3px; color: #56b9cf; font-weight: 700; margin-bottom: 14px; }
.mm-list { margin: 0 0 16px; padding-left: 18px; color: #c2cee2; line-height: 1.55; font-size: 14px; }
.mm-list li { margin-bottom: 9px; }
.mm-list b { color: #e9eef7; font-weight: 600; }
@keyframes mmIn { 0% { opacity: 0; } 100% { opacity: 1; } }

@media (max-width: 640px) {
  .mm-content { padding-top: 12vh; }
  .mm-title { letter-spacing: 3px; }
  .mm-scene { height: 48%; }
}
@media (prefers-reduced-motion: reduce) { .mm-fog, .mm-embers i { animation: none; } }
`;
