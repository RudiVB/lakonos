"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string | null;
  handled: boolean | null;
  notes: string | null;
  created_at: string;
};

export default function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function load() {
    const res = await fetch("/api/admin/leads");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json().catch(() => ({ leads: [] }));
    setLeads(data.leads || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function update(id: string, patch: Partial<Lead>) {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    await fetch("/api/admin/leads/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
  }

  const open = leads.filter((l) => !l.handled).length;
  const fmt = (d: string) =>
    new Date(d).toLocaleString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div>
      <h1>Leads</h1>
      <p className="admin-sub">
        {loading ? "Loading…" : `${leads.length} total · ${open} to follow up`}
      </p>

      {!loading && leads.length === 0 && (
        <p className="admin-empty">
          No leads yet — they’ll appear here the moment someone submits the form.
        </p>
      )}

      {leads.map((l) => (
        <div className={`lead-card${l.handled ? " done" : ""}`} key={l.id}>
          <div className="lead-top">
            <div>
              <div className="lead-name">
                {l.name}
                {l.company ? ` · ${l.company}` : ""}
              </div>
              <a className="lead-email" href={`mailto:${l.email}`}>
                {l.email}
              </a>
            </div>
            <span className="lead-meta">{fmt(l.created_at)}</span>
          </div>

          {l.message && <p className="lead-msg">{l.message}</p>}

          <textarea
            className="lead-notes"
            placeholder="Internal notes…"
            defaultValue={l.notes || ""}
            onBlur={(e) => update(l.id, { notes: e.target.value })}
          />

          <div className="lead-actions">
            <label>
              <input
                type="checkbox"
                checked={!!l.handled}
                onChange={(e) => update(l.id, { handled: e.target.checked })}
              />
              Followed up
            </label>
            <a className="btn btn-ghost" href={`mailto:${l.email}?subject=Lakonos`}>
              Reply
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
