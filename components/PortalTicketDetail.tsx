"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Message = {
  id: string;
  author_name: string | null;
  author_staff: string | null;
  body: string;
  created_at: string;
};

export default function PortalTicketDetail({ ticketId, subject }: { ticketId: string; subject: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await fetch(`/api/portal/tickets/messages?ticket_id=${ticketId}`);
    const d = await r.json().catch(() => ({ messages: [] }));
    setMessages(d.messages || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const r = await fetch("/api/portal/tickets/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: ticketId, body }),
    });
    if (r.ok) {
      setBody("");
      load();
    }
    setSending(false);
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleString("en-ZA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <Link className="admin-link" href="/portal">
        ← Back to requests
      </Link>
      <h1 style={{ marginTop: 10 }}>{subject}</h1>

      <div className="thread" style={{ marginTop: 16 }}>
        {loading && <p className="muted">Loading…</p>}
        {!loading && messages.length === 0 && <p className="muted">No messages yet.</p>}
        {messages.map((m) => {
          const fromStaff = !!m.author_staff;
          return (
            <div key={m.id} className="msg">
              <div className="meta">
                {fromStaff ? "Lakonos team" : m.author_name || "You"} · {fmt(m.created_at)}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
            </div>
          );
        })}
      </div>

      <form className="adminform" onSubmit={send} style={{ maxWidth: 720 }}>
        <textarea placeholder="Write a reply…" value={body} onChange={(e) => setBody(e.target.value)} />
        <button className="btn btn-primary" disabled={sending}>
          {sending ? "Sending…" : "Send reply"}
        </button>
      </form>
    </div>
  );
}
