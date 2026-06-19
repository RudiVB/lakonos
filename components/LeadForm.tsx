"use client";

import { useState } from "react";

// Captures a lead and posts it to /api/lead, which writes to Supabase.
export default function LeadForm() {
  const [form, setForm] = useState({ name: "", company: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  // update a single field
  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // submit handler (no native <form> POST — fully controlled)
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please email us instead.");
      }
      setStatus("ok");
      setForm({ name: "", company: "", email: "", message: "" });
    } catch (err) {
      setStatus("err");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  // success state
  if (status === "ok") {
    return (
      <p className="form-msg ok" style={{ marginTop: 28, fontSize: 16 }}>
        Λ &nbsp;Got it — we&apos;ll be in touch shortly.
      </p>
    );
  }

  return (
    <form className="lead-form" onSubmit={submit}>
      <div className="row">
        <input name="name" placeholder="Your name" value={form.name} onChange={update} required />
        <input name="company" placeholder="Company" value={form.company} onChange={update} />
      </div>
      <input
        name="email"
        type="email"
        placeholder="Work email"
        value={form.email}
        onChange={update}
        required
      />
      <textarea
        name="message"
        placeholder="What does your team do by hand today?"
        value={form.message}
        onChange={update}
      />
      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Get in touch"}
      </button>
      {status === "err" && <p className="form-msg err">{error}</p>}
    </form>
  );
}
