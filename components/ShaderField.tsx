"use client";

import { useEffect, useRef } from "react";

/* =====================================================================
   ShaderField — a living WebGL gradient for the hero.
   - Domain-warped fBm noise, tinted in the Lakonos gradient, that flows on
     its own and warps + glows toward the cursor; intensifies on scroll.
   - PROGRESSIVE: if WebGL is unavailable or the user prefers reduced motion,
     it shows nothing and the CSS aurora behind it remains — never breaks.
   - Pauses when the hero is off-screen or the tab is hidden (saves GPU);
     caps resolution on phones.
   - Vanilla WebGL — no dependencies.
   ===================================================================== */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;   // 0..1, y up
uniform float uScroll; // 0..1

float hash(vec2 p){ p = fract(p * vec2(123.34, 345.45)); p += dot(p, p + 34.345); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0,0.0)), c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;   // aspect-correct, centered
  p *= 1.0 + uScroll * 0.18;                              // gentle push-in on scroll
  float t = uTime * 0.06;

  // domain warp (flowing liquid look)
  vec2 q = vec2(fbm(p * 1.5 + t), fbm(p * 1.5 - t + 5.2));
  vec2 r = vec2(fbm(p * 2.0 + q * 1.6 + vec2(1.7, 9.2) + t),
                fbm(p * 2.0 + q * 1.6 + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.6 + r * 1.25) + uScroll * 0.06;

  // cursor warp + glow
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float md = length(p - m);
  f += 0.22 * exp(-md * 2.6);

  // brand palette: ink -> indigo -> violet -> cyan
  vec3 ink    = vec3(0.024, 0.024, 0.047);
  vec3 indigo = vec3(0.36,  0.40,  0.95);
  vec3 violet = vec3(0.69,  0.49,  0.99);
  vec3 cyan   = vec3(0.13,  0.83,  0.93);

  vec3 col = mix(ink, indigo, smoothstep(0.30, 0.72, f));
  col = mix(col, violet, smoothstep(0.55, 0.95, f + 0.10 * sin(t * 3.0 + r.x * 4.0)));
  col = mix(col, cyan,   smoothstep(0.72, 1.08, f + 0.15 * r.y));

  // keep the centre calmer (text sits there); brighten the edges
  float vig = smoothstep(0.10, 1.12, length(uv - 0.5));
  col *= mix(0.5, 1.18, vig);

  // cyan cursor halo + dither to kill banding
  col += 0.09 * exp(-md * 2.6) * cyan;
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function ShaderField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const gl = canvas.getContext("webgl", {
      antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "high-performance",
    }) as WebGLRenderingContext | null;
    if (!gl) { canvas.style.display = "none"; return; } // -> CSS aurora fallback

    // compile + link
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.style.display = "none"; return; }
    gl.useProgram(prog);

    // full-screen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uScroll = gl.getUniformLocation(prog, "uScroll");

    const maxDpr = coarse ? 1.0 : 1.5;
    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      W = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      H = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      gl.viewport(0, 0, W, H);
    };
    resize();
    window.addEventListener("resize", resize);

    // lerped cursor
    let mx = 0.5, my = 0.55, tmx = 0.5, tmy = 0.55;
    const onMove = (e: PointerEvent) => { tmx = e.clientX / window.innerWidth; tmy = 1 - e.clientY / window.innerHeight; };
    if (!coarse) window.addEventListener("pointermove", onMove, { passive: true });

    // scroll factor (0..1 across the hero)
    let scroll = 0;
    const onScroll = () => { scroll = Math.min(Math.max(window.scrollY / (window.innerHeight * 3), 0), 1); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const t0 = performance.now();
    let raf = 0;
    let visible = true;

    function frame(now: number) {
      mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
      gl!.uniform2f(uRes, W, H);
      gl!.uniform1f(uTime, (now - t0) / 1000);
      gl!.uniform2f(uMouse, mx, my);
      gl!.uniform1f(uScroll, scroll);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    }
    function start() { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
    function stop() { cancelAnimationFrame(raf); }

    // pause when off-screen
    const io = new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      if (visible && !reduce) start(); else stop();
    }, { threshold: 0 });
    io.observe(canvas);

    // pause when tab hidden
    const onVis = () => { if (document.hidden) stop(); else if (visible && !reduce) start(); };
    document.addEventListener("visibilitychange", onVis);

    if (reduce) {
      // one static, balanced frame
      gl.uniform2f(uRes, W, H);
      gl.uniform1f(uTime, 14.0);
      gl.uniform2f(uMouse, 0.5, 0.58);
      gl.uniform1f(uScroll, 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      start();
    }

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
    />
  );
}
