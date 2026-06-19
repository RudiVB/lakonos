import { NextResponse } from "next/server";
import { getStaff, canManageStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";
export const runtime = "nodejs";

const FIELDS = ["status", "due_date", "notes", "number"];

export async function POST(req: Request) {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageStaff(s.staff.role)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  for (const f of FIELDS) if (f in b) patch[f] = b[f];
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  const { error } = await supabaseAdmin.from("lakonos_invoices").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
