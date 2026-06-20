"use client";

import { useEffect, useRef, useState } from "react";

/* Captures a lead and posts it to /api/lead (which writes to Supabase).
   Adds: UTM/referrer/landing capture, honeypot + time-trap anti-spam,
   a premium success state, and an optional Vercel Analytics event. */

type Attr = {
  utm_source?: string; utm_medium?: string; utm_campaign?: string;
  referrer?: string; landing_path?: string;
};

export default function LeadForm() {
  const [form, setForm] = useState({ name: "", company: "", email: "", message: "" });
  const [website, setWebsite] = useState(""); // honeypot — real users never see/fill this
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  const renderedAt = useRef<number>(Date.now()); // time-trap baseline
  const attr = useRef<Attr>({});

  // Capture attribution once (persist for the session so it survives navigation).
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("lk_attr");
      if (stored) { attr.current = JSON.parse(stored); return; }
      const q = new URLSearchParams(window.location.search);
      const a: Attr = {
        utm_source: q.get("utm_source") || undefined,
        utm_medium: q.get("utm_medium") || undefined,
        utm_campaign: q.get("utm_campaign") || undefined,
        referrer: document.referrer || undefined,
        landing_path: window.location.pathname + window.location.search,
      };
      attr.current = a;
      sessionStorage.setItem("lk_attr", JSON.stringify(a));
    } catch { /* sessionStorage blocked — ignore, attribution just stays empty */ }
  }, []);

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          website,                                   // honeypot
          ts: renderedAt.current,                    // time-trap
          ...attr.current,                           // utm_* / referrer / landing_path
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please email us instead.");
      }
      setStatus("ok");
      setForm({ name: "", company: "", email: "", message: "" });
      // optional conversion event (no-op unless Vercel Analytics is mounted)
      (window as unknown as { va?: (e: string, p?: unknown) => void }).va?.("event", { name: "lead_submitted" });
    } catch (err) {
      setStatus("err");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  // premium success state
  if (status === "ok") {
    return (
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <div
          aria-hidden="true"
          style={{
            width: 56, height: 56, margin: "0 auto 16px", borderRadius: "50%",
            display: "grid", placeItems: "center",
            background: "linear-gradient(115deg,#a5b4fc,#d8b4fe 50%,#67e8f9)",
            color: "#0a0a12", fontSize: 28, fontWeight: 700,
            boxShadow: "0 10px 30px -10px rgba(139,92,246,.7)",
          }}
        >✓</div>
        <p className="form-msg ok" style={{ fontSize: 17, margin: 0 }}>
          Got it — we’ll be in touch within one business day.
        </p>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={submit}>
      <div className="row">
        <input name="name" placeholder="Your name" value={form.name} onChange={update} required autoComplete="name" />
        <input name="company" placeholder="Company" value={form.company} onChange={update} autoComplete="organization" />
      </div>
      <input name="email" type="email" placeholder="Work email" value={form.email} onChange={update} required autoComplete="email" />
      <textarea name="message" placeholder="What does your team do by hand today?" value={form.message} onChange={update} />

      {/* honeypot: off-screen, hidden from real users + assistive tech, tempting to bots */}
      <input
        type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
        value={website} onChange={(e) => setWebsite(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Get my free quote"}
      </button>
      {status === "err" && <p className="form-msg err">{error}</p>}
    </form>
  );
}
