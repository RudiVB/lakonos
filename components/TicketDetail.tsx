"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Client = { id: string; name: string };
type StaffMember = { id: string; name: string | null; email: string };
type Ticket = {
  id: string;
  client_id: string | null;
  subject: string;
  description: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
};
type Message = {
  id: string;
  author_name: string | null;
  author_staff: string | null;
  body: string;
  internal: boolean;
  created_at: string;
};

const PRIORITIES = ["low", "normal", "high", "urgent"];
const STATUSES = ["open", "in_progress", "waiting", "resolved", "closed"];

export default function TicketDetail({
  ticket: initial,
  staff,
  clients,
}: {
  ticket: Ticket;
  staff: StaffMember[];
  clients: Client[];
}) {
  const [ticket, setTicket] = useState<Ticket>(initial);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);

  async function loadMessages() {
    const r = await fetch(`/api/admin/tickets/messages?ticket_id=${ticket.id}`);
    const d = await r.json().catch(() => ({ messages: [] }));
    setMessages(d.messages || []);
  }
  useEffect(() => {
    loadMessages();
  }, []);

  // update a ticket field (status / priority / assignee)
  async function patch(field: string, value: string) {
    setTicket((t) => ({ ...t, [field]: value || null }));
    await fetch("/api/admin/tickets/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticket.id, [field]: value }),
    });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const r = await fetch("/api/admin/tickets/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: ticket.id, body, internal }),
    });
    if (r.ok) {
      setBody("");
      setInternal(false);
      loadMessages();
    }
    setSending(false);
  }

  const clientName = ticket.client_id
    ? clients.find((c) => c.id === ticket.client_id)?.name || "—"
    : "No client";
  const fmt = (d: string) =>
    new Date(d).toLocaleString("en-ZA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <Link className="admin-link" href="/admin/tickets">
        ← Tickets
      </Link>
      <h1 style={{ marginTop: 10 }}>{ticket.subject}</h1>
      <p className="admin-sub">
        {clientName} · opened {fmt(ticket.created_at)}
      </p>

      {/* controls */}
      <div className="adminform" style={{ maxWidth: 720 }}>
        <div className="row3">
          <div>
            <label>Status</label>
            <select value={ticket.status} onChange={(e) => patch("status", e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Priority</label>
            <select value={ticket.priority} onChange={(e) => patch("priority", e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Assignee</label>
            <select value={ticket.assigned_to || ""} onChange={(e) => patch("assigned_to", e.target.value)}>
              <option value="">Unassigned</option>
              {staff.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.email}
                </option>
              ))}
            </select>
          </div>
        </div>
        {ticket.description && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</p>}
      </div>

      {/* thread */}
      <h3 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Conversation</h3>
      <div className="thread">
        {messages.length === 0 && <p className="muted">No replies yet.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`msg${m.internal ? " int" : ""}`}>
            <div className="meta">
              {m.author_name || "Staff"} · {fmt(m.created_at)}
              {m.internal ? " · internal note" : !m.author_staff ? " · from client" : ""}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
          </div>
        ))}
      </div>

      {/* reply */}
      <form className="adminform" onSubmit={send} style={{ maxWidth: 720 }}>
        <textarea placeholder="Write a reply…" value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="row-actions" style={{ justifyContent: "space-between" }}>
          <label style={{ fontSize: 13, color: "var(--steel)" }}>
            <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note
          </label>
          <button className="btn btn-primary" disabled={sending}>
            {sending ? "Sending…" : "Add reply"}
          </button>
        </div>
      </form>
    </div>
  );
}
