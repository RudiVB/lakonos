"use client";

import { useEffect, useState } from "react";

type Member = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
};

export default function StaffPanel() {
  const [staff, setStaff] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: "", name: "", role: "support", password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/staff");
    const d = await r.json().catch(() => ({ staff: [] }));
    setStaff(d.staff || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    const r = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setMsg(`Added ${form.email}. Share the temporary password — they can change it after signing in.`);
      setForm({ email: "", name: "", role: "support", password: "" });
      load();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Could not add staff.");
    }
    setSaving(false);
  }

  return (
    <div>
      <h1>Staff</h1>
      <p className="admin-sub">
        {loading ? "Loading…" : `${staff.length} member${staff.length === 1 ? "" : "s"}`}
      </p>

      {staff.map((m) => (
        <div className="staff-row" key={m.id}>
          <div>
            <strong>{m.name || m.email}</strong>
            <div className="lead-email">{m.email}</div>
          </div>
          <span className="staff-role">
            {m.role}
            {!m.active ? " · inactive" : ""}
          </span>
        </div>
      ))}

      <form className="adminform" onSubmit={add}>
        <h3>Add a staff member</h3>
        <div className="row2">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="row2">
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Admin — manage everything</option>
            <option value="support">Support — leads &amp; tickets</option>
            <option value="viewer">Viewer — read only</option>
          </select>
          <input
            placeholder="Temporary password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Adding…" : "Add staff"}
        </button>
        {msg && <p className="form-msg ok">{msg}</p>}
        {err && <p className="form-msg err">{err}</p>}
      </form>
    </div>
  );
}
