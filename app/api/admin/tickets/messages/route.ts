import { NextResponse } from "next/server";
import { getStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";
export const runtime = "nodejs";

// list messages for a ticket
export async function GET(req: Request) {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ticketId = new URL(req.url).searchParams.get("ticket_id");
  if (!ticketId) return NextResponse.json({ error: "Missing ticket_id" }, { status: 400 });
  const { data, error } = await supabaseAdmin
    .from("lakonos_ticket_messages").select("*")
    .eq("ticket_id", ticketId).order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data ?? [] });
}

// add a reply (also bumps the ticket's updated_at)
export async function POST(req: Request) {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.ticket_id || !b.body) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const { error } = await supabaseAdmin.from("lakonos_ticket_messages").insert({
    ticket_id: b.ticket_id, body: b.body, internal: !!b.internal,
    author_staff: s.staff.id, author_name: s.staff.name || s.staff.email,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabaseAdmin.from("lakonos_tickets")
    .update({ updated_at: new Date().toISOString() }).eq("id", b.ticket_id);
  return NextResponse.json({ ok: true }, { status: 201 });
}
