"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Metrics = {
  newLeads: number;
  openTickets: number;
  mrr: number;
  outstanding: number;
  activeClients: number;
  monthHours: number;
};
type Lead = { id: string; name: string; company: string | null; handled: boolean | null; created_at: string };
type Ticket = { id: string; subject: string; status: string; priority: string; updated_at: string };

const rands = (n: number) =>
  "R" + (Number(n) || 0).toLocaleString("en-ZA", { minimumFractionDigits: 0 });

export default function DashboardPanel() {
  const [m, setM] = useState<Metrics | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/overview");
      if (r.status === 401) {
        router.push("/admin/login");
        return;
      }
      const d = await r.json().catch(() => ({}));
      setM(d.metrics || null);
      setLeads(d.recentLeads || []);
      setTickets(d.recentTickets || []);
      setLoading(false);
    })();
  }, []);

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" });

  return (
    <div>
      <h1>Overview</h1>
      <p className="admin-sub">{loading ? "Loading…" : "Your business at a glance"}</p>

      {m && (
        <div className="dash-grid">
          <Link className="dash-card" href="/admin/leads">
            <div className="v">{m.newLeads}</div>
            <div className="k">New leads</div>
          </Link>
          <Link className="dash-card" href="/admin/tickets">
            <div className="v">{m.openTickets}</div>
            <div className="k">Open tickets</div>
          </Link>
          <Link className="dash-card" href="/admin/retainers">
            <div className="v">{rands(m.mrr)}</div>
            <div className="k">Monthly recurring</div>
          </Link>
          <Link className="dash-card" href="/admin/invoices">
            <div className="v">{rands(m.outstanding)}</div>
            <div className="k">Outstanding invoices</div>
          </Link>
          <Link className="dash-card" href="/admin/clients">
            <div className="v">{m.activeClients}</div>
            <div className="k">Active clients</div>
          </Link>
          <Link className="dash-card" href="/admin/time">
            <div className="v">{m.monthHours}h</div>
            <div className="k">Hours this month</div>
          </Link>
        </div>
      )}

      <div className="dash-cols">
        <div className="dash-list">
          <h3>Latest leads</h3>
          {leads.length === 0 && <p className="muted">No leads yet.</p>}
          {leads.map((l) => (
            <div className="drow" key={l.id}>
              <Link href="/admin/leads">
                {l.name}
                {l.company ? ` · ${l.company}` : ""}
              </Link>
              <span className="muted">
                {l.handled ? "done" : "new"} · {fmt(l.created_at)}
              </span>
            </div>
          ))}
        </div>

        <div className="dash-list">
          <h3>Recent tickets</h3>
          {tickets.length === 0 && <p className="muted">No tickets yet.</p>}
          {tickets.map((t) => (
            <div className="drow" key={t.id}>
              <Link href={`/admin/tickets/${t.id}`}>{t.subject}</Link>
              <span className="muted">
                {t.status.replace("_", " ")} · {fmt(t.updated_at)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
