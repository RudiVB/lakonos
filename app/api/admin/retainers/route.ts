import { NextResponse } from "next/server";
import { getStaff, canManageStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";
export const runtime = "nodejs";

export async function GET() {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("lakonos_retainers").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ retainers: data ?? [] });
}

export async function POST(req: Request) {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageStaff(s.staff.role)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!b.client_id) return NextResponse.json({ error: "Pick a client." }, { status: 400 });
  const { error } = await supabaseAdmin.from("lakonos_retainers").insert({
    client_id: b.client_id, title: b.title || "Monthly retainer",
    amount: Number(b.amount) || 0, cycle: b.cycle || "monthly",
    status: b.status || "active", start_date: b.start_date || null,
    next_bill_date: b.next_bill_date || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
