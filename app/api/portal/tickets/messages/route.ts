import { NextResponse } from "next/server";
import { getClientUser } from "@/lib/client";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { notifyStaffClientTicket } from "@/lib/notify";
export const runtime = "nodejs";

// verify the ticket belongs to this client
async function ownsTicket(clientId: string, ticketId: string) {
  const { data } = await supabaseAdmin
    .from("lakonos_tickets").select("id,subject,client_id").eq("id", ticketId).maybeSingle();
  return data && data.client_id === clientId ? data : null;
}

export async function GET(req: Request) {
  const s = await getClientUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ticketId = new URL(req.url).searchParams.get("ticket_id") || "";
  const ticket = await ownsTicket(s.clientUser.client_id, ticketId);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // hide internal notes from clients
  const { data, error } = await supabaseAdmin
    .from("lakonos_ticket_messages")
    .select("id,author_name,author_staff,body,created_at")
    .eq("ticket_id", ticketId)
    .eq("internal", false)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ticket: { id: ticket.id, subject: ticket.subject }, messages: data ?? [] });
}

export async function POST(req: Request) {
  const s = await getClientUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const ticket = await ownsTicket(s.clientUser.client_id, b.ticket_id || "");
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!b.body) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  await supabaseAdmin.from("lakonos_ticket_messages").insert({
    ticket_id: ticket.id,
    body: b.body,
    internal: false, // clients can never post internal notes
    author_name: s.clientUser.name || s.clientName,
  });
  // bump + reopen if it was resolved
  await supabaseAdmin.from("lakonos_tickets")
    .update({ updated_at: new Date().toISOString(), status: "open" })
    .eq("id", ticket.id).in("status", ["resolved", "closed"]);
  await supabaseAdmin.from("lakonos_tickets")
    .update({ updated_at: new Date().toISOString() }).eq("id", ticket.id);

  await notifyStaffClientTicket(ticket.subject, s.clientName, true);
  return NextResponse.json({ ok: true }, { status: 201 });
}
