import { NextResponse } from "next/server";
import { getStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, handled, notes } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (typeof handled === "boolean") patch.handled = handled;
  if (typeof notes === "string") patch.notes = notes;
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  const { error } = await supabaseAdmin.from("lakonos_leads").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
