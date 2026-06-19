"use client";

import { useEffect, useState } from "react";

type Client = { id: string; name: string };
type Project = { id: string; name: string; client_id: string };
type Entry = {
  id: string;
  client_id: string | null;
  project_id: string | null;
  description: string | null;
  minutes: number;
  entry_date: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const hrs = (m: number) => (m / 60).toFixed(2) + "h";

export default function TimePanel() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ entry_date: today(), client_id: "", project_id: "", description: "", minutes: "" });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [e, c, p] = await Promise.all([
      fetch("/api/admin/time"),
      fetch("/api/admin/clients"),
      fetch("/api/admin/projects"),
    ]);
    setEntries((await e.json().catch(() => ({ entries: [] }))).entries || []);
    setClients((await c.json().catch(() => ({ clients: [] }))).clients || []);
    setProjects((await p.json().catch(() => ({ projects: [] }))).projects || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const clientName = (id: string | null) => (id ? clients.find((c) => c.id === id)?.name || "—" : "—");
  const projectName = (id: string | null) => (id ? projects.find((p) => p.id === id)?.name || "—" : "—");

  // projects filtered to the chosen client (if any)
  const projForClient = form.client_id ? projects.filter((p) => p.client_id === form.client_id) : projects;

  // total hours logged this month
  const month = today().slice(0, 7);
  const monthMinutes = entries.filter((e) => e.entry_date.startsWith(month)).reduce((s, e) => s + e.minutes, 0);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.minutes || Number(form.minutes) <= 0) {
      setErr("Enter minutes worked.");
      return;
    }
    setSaving(true);
    setErr("");
    const r = await fetch("/api/admin/time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setForm({ entry_date: today(), client_id: "", project_id: "", description: "", minutes: "" });
      load();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Could not log time.");
    }
    setSaving(false);
  }

  return (
    <div>
      <h1>Time</h1>
      <div className="stat-row">
        <div className="s">
          <b>{(monthMinutes / 60).toFixed(1)}h</b>
          <span>Logged this month</span>
        </div>
        <div className="s">
          <b>{entries.length}</b>
          <span>Entries</span>
        </div>
      </div>

      {!loading && entries.length > 0 && (
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Project</th>
              <th>Description</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="muted">{e.entry_date}</td>
                <td>{clientName(e.client_id)}</td>
                <td className="muted">{projectName(e.project_id)}</td>
                <td>{e.description || <span className="muted">—</span>}</td>
                <td>{hrs(e.minutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && entries.length === 0 && <p className="admin-empty">No time logged yet.</p>}

      <form className="adminform" onSubmit={add}>
        <h3>Log time</h3>
        <div className="row3">
          <div>
            <label>Date</label>
            <input
              type="date"
              value={form.entry_date}
              onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
            />
          </div>
          <select
            value={form.client_id}
            onChange={(e) => setForm({ ...form, client_id: e.target.value, project_id: "" })}
          >
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
            <option value="">No project</option>
            {projForClient.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="row2">
          <input
            placeholder="What did you work on?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Minutes"
            value={form.minutes}
            onChange={(e) => setForm({ ...form, minutes: e.target.value })}
          />
        </div>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Logging…" : "Log time"}
        </button>
        {err && <p className="form-msg err">{err}</p>}
      </form>
    </div>
  );
}
