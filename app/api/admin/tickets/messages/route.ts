import { NextResponse } from "next/server";
import { getStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { notifyClientTicketReply } from "@/lib/notify";
export const runtime = "nodejs";

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

export async function POST(req: Request) {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.ticket_id || !b.body) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await supabaseAdmin.from("lakonos_ticket_messages").insert({
    ticket_id: b.ticket_id, body: b.body, internal: !!b.internal,
    author_staff: s.staff.id, author_name: s.staff.name || s.staff.email,
  });
  await supabaseAdmin.from("lakonos_tickets")
    .update({ updated_at: new Date().toISOString() }).eq("id", b.ticket_id);

  // email the client on public replies
  if (!b.internal) {
    const { data: t } = await supabaseAdmin
      .from("lakonos_tickets").select("subject,client_id").eq("id", b.ticket_id).maybeSingle();
    if (t?.client_id) {
      const { data: c } = await supabaseAdmin
        .from("lakonos_clients").select("email").eq("id", t.client_id).maybeSingle();
      let to: string | null = c?.email || null;
      if (!to) {
        const { data: cu } = await supabaseAdmin
          .from("lakonos_client_users").select("email").eq("client_id", t.client_id).limit(1).maybeSingle();
        to = cu?.email || null;
      }
      await notifyClientTicketReply(to, t.subject, b.body);
    }
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
