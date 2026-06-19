import { NextResponse } from "next/server";
import { getClientUser } from "@/lib/client";
import { supabaseAdmin } from "@/lib/supabaseServer";
export const runtime = "nodejs";

export async function GET() {
  const s = await getClientUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: retainers } = await supabaseAdmin
    .from("lakonos_retainers")
    .select("id,title,amount,cycle,status,next_bill_date,pf_subscribed,last_paid_at")
    .eq("client_id", s.clientUser.client_id)
    .order("created_at", { ascending: false });
  const { data: payments } = await supabaseAdmin
    .from("lakonos_payments")
    .select("id,amount,paid_at,retainer_id")
    .eq("client_id", s.clientUser.client_id)
    .order("paid_at", { ascending: false })
    .limit(50);
  return NextResponse.json({ retainers: retainers ?? [], payments: payments ?? [] });
}
