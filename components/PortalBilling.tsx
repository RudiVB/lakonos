"use client";

import { useEffect, useState } from "react";

type Retainer = {
  id: string;
  title: string;
  amount: number;
  cycle: string;
  status: string;
  next_bill_date: string | null;
  pf_subscribed: boolean;
  last_paid_at: string | null;
};
type Payment = { id: string; amount: number; paid_at: string };
type Invoice = { id: string; number: string | null; status: string; issue_date: string; total: number };

const rands = (n: number) =>
  "R" + (Number(n) || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PortalBilling() {
  const [retainers, setRetainers] = useState<Retainer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [banner, setBanner] = useState<{ kind: string; text: string } | null>(null);
  const [busyId, setBusyId] = useState("");

  // read ?status from the PayFast return without useSearchParams (no Suspense needed)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success") setBanner({ kind: "ok", text: "Payment set up — thank you! Your retainer is now on automatic billing." });
    else if (status === "cancelled") setBanner({ kind: "warn", text: "Payment setup was cancelled. You can try again any time." });
  }, []);

  async function load() {
    const r = await fetch("/api/portal/billing");
    const d = await r.json().catch(() => ({ retainers: [], payments: [], invoices: [] }));
    setRetainers(d.retainers || []);
    setPayments(d.payments || []);
    setInvoices(d.invoices || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  // build a PayFast form from the checkout response and submit it
  async function setup(retainerId: string) {
    setBusyId(retainerId);
    setErr("");
    const r = await fetch("/api/portal/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ retainer_id: retainerId }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.url) {
      setErr(d.error || "Could not start checkout.");
      setBusyId("");
      return;
    }
    const form = document.createElement("form");
    form.method = "POST";
    form.action = d.url;
    Object.entries(d.fields as Record<string, string>).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = String(v);
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit(); // redirects to PayFast
  }

  return (
    <div>
      <h1>Billing</h1>

      {banner && <div className={`banner ${banner.kind}`}>{banner.text}</div>}
      {err && <p className="form-msg err">{err}</p>}

      <h3 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16, margin: "8px 0" }}>Your retainers</h3>
      {loading && <p className="muted">Loading…</p>}
      {!loading && retainers.length === 0 && <p className="admin-empty">No retainers on your account.</p>}

      {retainers.map((r) => (
        <div className="pay-card" key={r.id}>
          <div>
            <strong>{r.title}</strong>
            <div className="muted">
              {rands(r.amount)} · {r.cycle}
              {r.next_bill_date ? ` · next ${r.next_bill_date}` : ""}
            </div>
          </div>
          <div className="row-actions">
            {r.pf_subscribed ? (
              <span className="badge green">Auto-billing on</span>
            ) : (
              <button className="btn btn-primary mini" disabled={busyId === r.id} onClick={() => setup(r.id)}>
                {busyId === r.id ? "Opening…" : "Set up automatic payment"}
              </button>
            )}
          </div>
        </div>
      ))}

      {invoices.length > 0 && (
        <>
          <h3 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16, margin: "22px 0 8px" }}>
            Invoices
          </h3>
          <table className="tbl">
            <thead>
              <tr>
                <th>Number</th>
                <th>Issued</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((v) => (
                <tr key={v.id}>
                  <td>
                    <strong>{v.number || v.id.slice(0, 8)}</strong>
                  </td>
                  <td className="muted">{v.issue_date}</td>
                  <td>{rands(v.total)}</td>
                  <td className="muted">{v.status}</td>
                  <td>
                    <a className="linkish" href={`/invoice/${v.id}`}>
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {payments.length > 0 && (
        <>
          <h3 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16, margin: "22px 0 8px" }}>
            Payment history
          </h3>
          <table className="tbl">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="muted">{new Date(p.paid_at).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td>{rands(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
