import { NextResponse } from "next/server";
import { getClientUser } from "@/lib/client";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { notifyStaffClientTicket } from "@/lib/notify";
export const runtime = "nodejs";

export async function GET() {
  const s = await getClientUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // only this client's tickets
  const { data, error } = await supabaseAdmin
    .from("lakonos_tickets")
    .select("id,subject,status,priority,updated_at,created_at")
    .eq("client_id", s.clientUser.client_id)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tickets: data ?? [] });
}

export async function POST(req: Request) {
  const s = await getClientUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.subject) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  const allowed = ["low", "normal", "high"];
  const priority = allowed.includes(b.priority) ? b.priority : "normal";

  // client_id is FORCED to the logged-in client's id (never from the request)
  const { data, error } = await supabaseAdmin
    .from("lakonos_tickets")
    .insert({
      client_id: s.clientUser.client_id,
      subject: b.subject,
      description: b.description || null,
      priority,
      status: "open",
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // opening message from the client, then alert staff
  if (b.description) {
    await supabaseAdmin.from("lakonos_ticket_messages").insert({
      ticket_id: data.id,
      body: b.description,
      internal: false,
      author_name: s.clientUser.name || s.clientName,
    });
  }
  await notifyStaffClientTicket(b.subject, s.clientName, false);
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
