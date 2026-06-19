"use client";

import { useEffect, useState } from "react";

type Client = { id: string; name: string };
type Project = {
  id: string;
  client_id: string;
  name: string;
  status: string;
  budget: number | null;
  due_date: string | null;
};

const STATUSES = ["planning", "active", "on_hold", "done"];
const rands = (n: number | null) =>
  n == null ? "—" : "R" + Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 0 });

export default function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ client_id: "", name: "", status: "planning", budget: "", due_date: "" });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [r1, r2] = await Promise.all([fetch("/api/admin/projects"), fetch("/api/admin/clients")]);
    const d1 = await r1.json().catch(() => ({ projects: [] }));
    const d2 = await r2.json().catch(() => ({ clients: [] }));
    setProjects(d1.projects || []);
    setClients(d2.clients || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || "—";

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id || !form.name) {
      setErr("Client and project name are required.");
      return;
    }
    setSaving(true);
    setErr("");
    const r = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setForm({ client_id: "", name: "", status: "planning", budget: "", due_date: "" });
      load();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Could not add project.");
    }
    setSaving(false);
  }

  async function setStatus(id: string, status: string) {
    setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, status } : p)));
    await fetch("/api/admin/projects/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  return (
    <div>
      <h1>Projects</h1>
      <p className="admin-sub">{loading ? "Loading…" : `${projects.length} project(s)`}</p>

      {!loading && projects.length > 0 && (
        <table className="tbl">
          <thead>
            <tr>
              <th>Project</th>
              <th>Client</th>
              <th>Budget</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                </td>
                <td className="muted">{clientName(p.client_id)}</td>
                <td>{rands(p.budget)}</td>
                <td className="muted">{p.due_date || "—"}</td>
                <td>
                  <select value={p.status} onChange={(e) => setStatus(p.id, e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && projects.length === 0 && <p className="admin-empty">No projects yet.</p>}

      <form className="adminform" onSubmit={add}>
        <h3>Add a project</h3>
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
        <input
          placeholder="Project name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <div className="row3">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Budget (R)"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
          />
          <div>
            <label>Due date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
        </div>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Adding…" : "Add project"}
        </button>
        {err && <p className="form-msg err">{err}</p>}
      </form>
    </div>
  );
}
