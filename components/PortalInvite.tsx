"use client";

import { useEffect, useState } from "react";

type Client = { id: string; name: string };

// Lets owner/admin create a portal login for a client (so the client can log their own tickets).
export default function PortalInvite() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({ client_id: "", name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadClients() {
    const r = await fetch("/api/admin/clients");
    const d = await r.json().catch(() => ({ clients: [] }));
    setClients(d.clients || []);
  }
  useEffect(() => {
    loadClients();
  }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id) {
      setErr("Pick a client.");
      return;
    }
    setSaving(true);
    setMsg("");
    setErr("");
    const r = await fetch("/api/admin/clients/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setMsg(`Portal login created for ${form.email}. Send them the temp password and the link: /portal/login`);
      setForm({ client_id: "", name: "", email: "", password: "" });
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Could not create login.");
    }
    setSaving(false);
  }

  return (
    <form className="adminform" onSubmit={invite} style={{ marginTop: 10 }}>
      <h3>Invite a client to the portal</h3>
      <p className="muted" style={{ fontSize: 13, marginTop: -4 }}>
        Creates a login so the client can raise and track their own support tickets and manage billing.
      </p>
      <div>
        <label>Client</label>
        <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
          <option value="">Select a client…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="row2">
        <input placeholder="Contact name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input
          type="email"
          placeholder="Login email *"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <input
        placeholder="Temporary password *"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />
      <button className="btn btn-primary" disabled={saving}>
        {saving ? "Creating…" : "Create portal login"}
      </button>
      {msg && <p className="form-msg ok">{msg}</p>}
      {err && <p className="form-msg err">{err}</p>}
    </form>
  );
}
