import { NextResponse } from "next/server";
import { getStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";
export const runtime = "nodejs";

export async function GET() {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("lakonos_clients").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clients: data ?? [] });
}

export async function POST(req: Request) {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.name) return NextResponse.json({ error: "Company name is required." }, { status: 400 });
  const { error } = await supabaseAdmin.from("lakonos_clients").insert({
    name: b.name, contact_name: b.contact_name || null, email: b.email || null,
    phone: b.phone || null, status: b.status || "active", notes: b.notes || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
