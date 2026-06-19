import { NextResponse } from "next/server";
import { getStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";
export const runtime = "nodejs";

export async function GET() {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("lakonos_time_entries").select("*").order("entry_date", { ascending: false }).limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(req: Request) {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const minutes = Number(b.minutes) || 0;
  if (minutes <= 0) return NextResponse.json({ error: "Enter minutes worked." }, { status: 400 });
  const { error } = await supabaseAdmin.from("lakonos_time_entries").insert({
    staff_id: s.staff.id, client_id: b.client_id || null, project_id: b.project_id || null,
    description: b.description || null, minutes,
    entry_date: b.entry_date || new Date().toISOString().slice(0, 10),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
