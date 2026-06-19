import { NextResponse } from "next/server";
import { getStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET() {
  const session = await getStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("lakonos_leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data ?? [] });
}
