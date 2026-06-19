"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  updated_at: string;
};

const PRIORITIES = ["low", "normal", "high"];
const stBadge = (s: string) =>
  s === "open" ? "blue" : s === "in_progress" ? "amber" : s === "waiting" ? "amber" : s === "resolved" ? "green" : "grey";

export default function PortalTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: "", priority: "normal", description: "" });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/portal/tickets");
    const d = await r.json().catch(() => ({ tickets: [] }));
    setTickets(d.tickets || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject) {
      setErr("Please add a subject.");
      return;
    }
    setSaving(true);
    setErr("");
    const r = await fetch("/api/portal/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setForm({ subject: "", priority: "normal", description: "" });
      load();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Could not submit.");
    }
    setSaving(false);
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div>
      <h1>Support</h1>
      <p className="admin-sub">{loading ? "Loading…" : `${tickets.length} request(s)`}</p>

      {!loading && tickets.length > 0 && (
        <table className="tbl">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link className="linkish" href={`/portal/tickets/${t.id}`}>
                    <strong>{t.subject}</strong>
                  </Link>
                </td>
                <td className="muted">{t.priority}</td>
                <td>
                  <span className={`badge ${stBadge(t.status)}`}>{t.status.replace("_", " ")}</span>
                </td>
                <td className="muted">{fmt(t.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && tickets.length === 0 && <p className="admin-empty">No requests yet. Raise one below.</p>}

      <form className="adminform" onSubmit={add}>
        <h3>Raise a support request</h3>
        <input
          placeholder="Subject *"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          required
        />
        <div>
          <label>Priority</label>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <textarea
          placeholder="Describe what you need help with…"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Submitting…" : "Submit request"}
        </button>
        {err && <p className="form-msg err">{err}</p>}
      </form>
    </div>
  );
}
