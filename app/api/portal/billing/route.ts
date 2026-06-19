import { NextResponse } from "next/server";
import { getClientUser } from "@/lib/client";
import { supabaseAdmin } from "@/lib/supabaseServer";
export const runtime = "nodejs";

export async function GET() {
  const s = await getClientUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cid = s.clientUser.client_id;

  const [retR, payR, invR] = await Promise.all([
    supabaseAdmin.from("lakonos_retainers")
      .select("id,title,amount,cycle,status,next_bill_date,pf_subscribed,last_paid_at")
      .eq("client_id", cid).order("created_at", { ascending: false }),
    supabaseAdmin.from("lakonos_payments")
      .select("id,amount,paid_at,retainer_id")
      .eq("client_id", cid).order("paid_at", { ascending: false }).limit(50),
    supabaseAdmin.from("lakonos_invoices")
      .select("id,number,status,issue_date,total")
      .eq("client_id", cid).neq("status", "draft").order("issue_date", { ascending: false }),
  ]);

  return NextResponse.json({ retainers: retR.data ?? [], payments: payR.data ?? [], invoices: invR.data ?? [] });
}
