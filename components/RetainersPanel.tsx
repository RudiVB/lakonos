"use client";

import { useEffect, useState } from "react";

type Client = { id: string; name: string };
type Retainer = {
  id: string;
  client_id: string;
  title: string;
  amount: number;
  cycle: string;
  status: string;
  next_bill_date: string | null;
  pf_subscribed: boolean;
  pf_token: string | null;
};

const CYCLES = ["monthly", "quarterly", "annual"];
const STATUSES = ["active", "paused", "cancelled"];
const rands = (n: number) =>
  "R" + (Number(n) || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// monthly-equivalent value, for MRR
const monthly = (r: Retainer) =>
  r.status !== "active" ? 0 : r.cycle === "annual" ? r.amount / 12 : r.cycle === "quarterly" ? r.amount / 3 : r.amount;

export default function RetainersPanel() {
  const [rets, setRets] = useState<Retainer[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ client_id: "", title: "Monthly retainer", amount: "", cycle: "monthly", next_bill_date: "" });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [r1, r2] = await Promise.all([fetch("/api/admin/retainers"), fetch("/api/admin/clients")]);
    const d1 = await r1.json().catch(() => ({ retainers: [] }));
    const d2 = await r2.json().catch(() => ({ clients: [] }));
    setRets(d1.retainers || []);
    setClients(d2.clients || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || "—";
  const mrr = rets.reduce((sum, r) => sum + monthly(r), 0);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id) {
      setErr("Pick a client.");
      return;
    }
    setSaving(true);
    setErr("");
    const r = await fetch("/api/admin/retainers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setForm({ client_id: "", title: "Monthly retainer", amount: "", cycle: "monthly", next_bill_date: "" });
      load();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Could not add retainer.");
    }
    setSaving(false);
  }

  async function setStatus(id: string, status: string) {
    setRets((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch("/api/admin/retainers/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  // pause / resume / cancel the PayFast subscription
  async function subAction(id: string, action: "pause" | "resume" | "cancel") {
    if (action === "cancel" && !confirm("Cancel this subscription? Automatic billing will stop.")) return;
    setErr("");
    const r = await fetch("/api/admin/retainers/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ retainer_id: id, action }),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Action failed.");
      return;
    }
    load();
  }

  return (
    <div>
      <h1>Retainers</h1>
      <div className="stat-row">
        <div className="s">
          <b>{rands(mrr)}</b>
          <span>Monthly recurring (MRR)</span>
        </div>
        <div className="s">
          <b>{rets.filter((r) => r.status === "active").length}</b>
          <span>Active retainers</span>
        </div>
      </div>

      {!loading && rets.length > 0 && (
        <table className="tbl">
          <thead>
            <tr>
              <th>Client</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Cycle</th>
              <th>Next bill</th>
              <th>Status</th>
              <th>Billing</th>
            </tr>
          </thead>
          <tbody>
            {rets.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{clientName(r.client_id)}</strong>
                </td>
                <td>{r.title}</td>
                <td>{rands(r.amount)}</td>
                <td className="muted">{r.cycle}</td>
                <td className="muted">{r.next_bill_date || "—"}</td>
                <td>
                  <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {r.pf_subscribed && r.pf_token ? (
                    <div className="row-actions">
                      {r.status === "paused" ? (
                        <button className="btn btn-ghost mini" onClick={() => subAction(r.id, "resume")}>
                          Resume
                        </button>
                      ) : (
                        <button className="btn btn-ghost mini" onClick={() => subAction(r.id, "pause")}>
                          Pause
                        </button>
                      )}
                      <button className="btn btn-ghost mini" onClick={() => subAction(r.id, "cancel")}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && rets.length === 0 && <p className="admin-empty">No retainers yet.</p>}

      <form className="adminform" onSubmit={add}>
        <h3>Add a retainer</h3>
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
          placeholder="Title (e.g. Support & maintenance)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <div className="row3">
          <input
            type="number"
            step="0.01"
            placeholder="Amount (R)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <select value={form.cycle} onChange={(e) => setForm({ ...form, cycle: e.target.value })}>
            {CYCLES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div>
            <label>Next bill date</label>
            <input
              type="date"
              value={form.next_bill_date}
              onChange={(e) => setForm({ ...form, next_bill_date: e.target.value })}
            />
          </div>
        </div>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Adding…" : "Add retainer"}
        </button>
        {err && <p className="form-msg err">{err}</p>}
      </form>
    </div>
  );
}
