"use client";

import { useEffect, useState } from "react";

type Client = { id: string; name: string };
type Invoice = {
  id: string;
  client_id: string | null;
  number: string | null;
  status: string;
  issue_date: string;
  total: number;
};
type Item = { description: string; qty: string; unit_price: string };

const STATUSES = ["draft", "sent", "paid", "overdue", "void"];
const rands = (n: number) =>
  "R" + (Number(n) || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InvoicesPanel() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ client_id: "", number: "", due_date: "", notes: "", no_vat: false });
  const [items, setItems] = useState<Item[]>([{ description: "", qty: "1", unit_price: "" }]);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [i, c] = await Promise.all([fetch("/api/admin/invoices"), fetch("/api/admin/clients")]);
    setInvoices((await i.json().catch(() => ({ invoices: [] }))).invoices || []);
    setClients((await c.json().catch(() => ({ clients: [] }))).clients || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const clientName = (id: string | null) => (id ? clients.find((c) => c.id === id)?.name || "—" : "—");

  // live totals
  const subtotal =
    Math.round(items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unit_price) || 0), 0) * 100) / 100;
  const vat = form.no_vat ? 0 : Math.round(subtotal * 0.15 * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;

  function setItem(i: number, key: keyof Item, val: string) {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  }
  const addRow = () => setItems((a) => [...a, { description: "", qty: "1", unit_price: "" }]);
  const removeRow = (i: number) => setItems((a) => (a.length > 1 ? a.filter((_, idx) => idx !== i) : a));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!items.some((it) => it.description.trim())) {
      setErr("Add at least one line item.");
      return;
    }
    setSaving(true);
    setErr("");
    const r = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });
    if (r.ok) {
      setForm({ client_id: "", number: "", due_date: "", notes: "", no_vat: false });
      setItems([{ description: "", qty: "1", unit_price: "" }]);
      load();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Could not create invoice.");
    }
    setSaving(false);
  }

  async function setStatus(id: string, status: string) {
    setInvoices((arr) => arr.map((v) => (v.id === id ? { ...v, status } : v)));
    await fetch("/api/admin/invoices/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  const outstanding = invoices
    .filter((v) => v.status === "sent" || v.status === "overdue")
    .reduce((s, v) => s + Number(v.total), 0);

  return (
    <div>
      <h1>Invoices</h1>
      <div className="stat-row">
        <div className="s">
          <b>{rands(outstanding)}</b>
          <span>Outstanding</span>
        </div>
        <div className="s">
          <b>{invoices.length}</b>
          <span>Total invoices</span>
        </div>
      </div>

      {!loading && invoices.length > 0 && (
        <table className="tbl">
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Issued</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((v) => (
              <tr key={v.id}>
                <td>
                  <strong>{v.number || v.id.slice(0, 8)}</strong>
                </td>
                <td className="muted">{clientName(v.client_id)}</td>
                <td className="muted">{v.issue_date}</td>
                <td>{rands(v.total)}</td>
                <td>
                  <select value={v.status} onChange={(e) => setStatus(v.id, e.target.value)}>
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
      {!loading && invoices.length === 0 && <p className="admin-empty">No invoices yet.</p>}

      <form className="adminform" onSubmit={create} style={{ maxWidth: 760 }}>
        <h3>New invoice</h3>
        <div className="row3">
          <div>
            <label>Client</label>
            <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
              <option value="">No client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <input
            placeholder="Invoice no."
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
          />
          <div>
            <label>Due date</label>
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
        </div>

        <label>Line items</label>
        {items.map((it, i) => (
          <div className="row3" key={i}>
            <input
              placeholder="Description"
              value={it.description}
              onChange={(e) => setItem(i, "description", e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Qty"
              value={it.qty}
              onChange={(e) => setItem(i, "qty", e.target.value)}
            />
            <div className="row-actions">
              <input
                type="number"
                step="0.01"
                placeholder="Unit price"
                value={it.unit_price}
                onChange={(e) => setItem(i, "unit_price", e.target.value)}
              />
              <button type="button" className="btn btn-ghost mini" onClick={() => removeRow(i)}>
                ✕
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-ghost mini" onClick={addRow} style={{ justifySelf: "start" }}>
          + Add line
        </button>

        <label style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={!form.no_vat}
            onChange={(e) => setForm({ ...form, no_vat: !e.target.checked })}
          />{" "}
          Add 15% VAT
        </label>

        <div className="stat-row" style={{ margin: "4px 0" }}>
          <div className="s">
            <b style={{ fontSize: 18 }}>{rands(subtotal)}</b>
            <span>Subtotal</span>
          </div>
          <div className="s">
            <b style={{ fontSize: 18 }}>{rands(vat)}</b>
            <span>VAT</span>
          </div>
          <div className="s">
            <b style={{ fontSize: 18 }}>{rands(total)}</b>
            <span>Total</span>
          </div>
        </div>

        <textarea
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Creating…" : "Create invoice"}
        </button>
        {err && <p className="form-msg err">{err}</p>}
      </form>
    </div>
  );
}
