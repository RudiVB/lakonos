import { NextResponse } from "next/server";
import { getClientUser } from "@/lib/client";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { buildSubscriptionFields, freqFromCycle, payfastConfigured } from "@/lib/payfast";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const s = await getClientUser();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!payfastConfigured()) return NextResponse.json({ error: "Billing is not set up yet." }, { status: 400 });

  const { retainer_id } = await req.json().catch(() => ({}));
  if (!retainer_id) return NextResponse.json({ error: "Missing retainer_id" }, { status: 400 });

  // retainer must belong to this client
  const { data: ret } = await supabaseAdmin
    .from("lakonos_retainers").select("*").eq("id", retainer_id).maybeSingle();
  if (!ret || ret.client_id !== s.clientUser.client_id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://lakonos.vercel.app";
  const today = new Date().toISOString().slice(0, 10);
  let billingDate = ret.next_bill_date || today;
  if (billingDate < today) billingDate = today; // PayFast requires today/future

  const { url, fields } = buildSubscriptionFields({
    mPaymentId: ret.id,
    amount: Number(ret.amount) || 0,
    itemName: ret.title || "Retainer",
    frequency: freqFromCycle(ret.cycle),
    billingDate,
    nameFirst: s.clientUser.name || undefined,
    email: s.clientUser.email,
    returnUrl: `${base}/portal/billing?status=success`,
    cancelUrl: `${base}/portal/billing?status=cancelled`,
    notifyUrl: `${base}/api/payfast/itn`,
  });
  return NextResponse.json({ url, fields });
}
