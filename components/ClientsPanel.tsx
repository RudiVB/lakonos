"use client";

import { useEffect, useState } from "react";

type Client = {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

const STATUSES = ["prospect", "active", "paused", "churned"];

export default function ClientsPanel() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", contact_name: "", email: "", phone: "", status: "active" });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/clients");
    const d = await r.json().catch(() => ({ clients: [] }));
    setClients(d.clients || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    const r = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setForm({ name: "", contact_name: "", email: "", phone: "", status: "active" });
      load();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Could not add client.");
    }
    setSaving(false);
  }

  async function setStatus(id: string, status: string) {
    setClients((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
    await fetch("/api/admin/clients/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  return (
    <div>
      <h1>Clients</h1>
      <p className="admin-sub">{loading ? "Loading…" : `${clients.length} client(s)`}</p>

      {!loading && clients.length > 0 && (
        <table className="tbl">
          <thead>
            <tr>
              <th>Company</th>
              <th>Contact</th>
              <th>Email / Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.name}</strong>
                </td>
                <td>{c.contact_name || <span className="muted">—</span>}</td>
                <td>
                  {c.email && (
                    <a className="linkish" href={`mailto:${c.email}`}>
                      {c.email}
                    </a>
                  )}
                  {c.phone && <div className="muted">{c.phone}</div>}
                  {!c.email && !c.phone && <span className="muted">—</span>}
                </td>
                <td>
                  <select value={c.status} onChange={(e) => setStatus(c.id, e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form className="adminform" onSubmit={add}>
        <h3>Add a client</h3>
        <div className="row2">
          <input
            placeholder="Company name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Contact person"
            value={form.contact_name}
            onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
          />
        </div>
        <div className="row2">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Adding…" : "Add client"}
        </button>
        {err && <p className="form-msg err">{err}</p>}
      </form>
    </div>
  );
}
