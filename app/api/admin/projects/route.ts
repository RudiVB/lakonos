import { NextResponse } from "next/server";
import { getStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";
export const runtime = "nodejs";

export async function GET() {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("lakonos_projects").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data ?? [] });
}

export async function POST(req: Request) {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.client_id || !b.name) return NextResponse.json({ error: "Client and name are required." }, { status: 400 });
  const { error } = await supabaseAdmin.from("lakonos_projects").insert({
    client_id: b.client_id, name: b.name, status: b.status || "planning",
    budget: b.budget ? Number(b.budget) : null,
    start_date: b.start_date || null, due_date: b.due_date || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
