"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Client = { id: string; name: string };
type StaffMember = { id: string; name: string | null; email: string };
type Ticket = {
  id: string;
  client_id: string | null;
  subject: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  updated_at: string;
};

const PRIORITIES = ["low", "normal", "high", "urgent"];
const prBadge = (p: string) => (p === "urgent" ? "red" : p === "high" ? "amber" : p === "low" ? "grey" : "blue");
const stBadge = (s: string) =>
  s === "open" ? "blue" : s === "in_progress" ? "amber" : s === "waiting" ? "amber" : s === "resolved" ? "green" : "grey";

export default function TicketsPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: "", client_id: "", priority: "normal", assigned_to: "", description: "" });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [t, c, s] = await Promise.all([
      fetch("/api/admin/tickets"),
      fetch("/api/admin/clients"),
      fetch("/api/admin/staff"),
    ]);
    setTickets((await t.json().catch(() => ({ tickets: [] }))).tickets || []);
    setClients((await c.json().catch(() => ({ clients: [] }))).clients || []);
    setStaff((await s.json().catch(() => ({ staff: [] }))).staff || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const clientName = (id: string | null) => (id ? clients.find((c) => c.id === id)?.name || "—" : "—");
  const staffName = (id: string | null) =>
    id ? staff.find((m) => m.id === id)?.name || staff.find((m) => m.id === id)?.email || "—" : "Unassigned";

  const openCount = tickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject) {
      setErr("Subject is required.");
      return;
    }
    setSaving(true);
    setErr("");
    const r = await fetch("/api/admin/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setForm({ subject: "", client_id: "", priority: "normal", assigned_to: "", description: "" });
      load();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Could not create ticket.");
    }
    setSaving(false);
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" });

  return (
    <div>
      <h1>Tickets</h1>
      <div className="stat-row">
        <div className="s">
          <b>{openCount}</b>
          <span>Open tickets</span>
        </div>
        <div className="s">
          <b>{tickets.length}</b>
          <span>Total</span>
        </div>
      </div>

      {!loading && tickets.length > 0 && (
        <table className="tbl">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Client</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link className="linkish" href={`/admin/tickets/${t.id}`}>
                    <strong>{t.subject}</strong>
                  </Link>
                </td>
                <td className="muted">{clientName(t.client_id)}</td>
                <td>
                  <span className={`badge ${prBadge(t.priority)}`}>{t.priority}</span>
                </td>
                <td>
                  <span className={`badge ${stBadge(t.status)}`}>{t.status.replace("_", " ")}</span>
                </td>
                <td className="muted">{staffName(t.assigned_to)}</td>
                <td className="muted">{fmt(t.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && tickets.length === 0 && <p className="admin-empty">No tickets yet.</p>}

      <form className="adminform" onSubmit={add}>
        <h3>New ticket</h3>
        <input
          placeholder="Subject *"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          required
        />
        <div className="row3">
          <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
            <option value="">Unassigned</option>
            {staff.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name || m.email}
              </option>
            ))}
          </select>
        </div>
        <textarea
          placeholder="Describe the issue…"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Creating…" : "Create ticket"}
        </button>
        {err && <p className="form-msg err">{err}</p>}
      </form>
    </div>
  );
}
