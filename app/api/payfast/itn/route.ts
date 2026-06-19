import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { validateItn } from "@/lib/payfast";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();
  const { ok, data } = await validateItn(raw);
  if (!ok) return new NextResponse("Invalid", { status: 400 });

  // acknowledge non-complete states without acting
  if ((data.payment_status || "").toUpperCase() !== "COMPLETE") {
    return new NextResponse("OK", { status: 200 });
  }

  const amount = Number(data.amount_gross || data.amount || 0);
  const token = data.token || null;
  const mPaymentId = data.m_payment_id || null;

  // resolve the retainer: by subscription token first, then by m_payment_id
  let retainer: any = null;
  if (token) {
    const { data: r } = await supabaseAdmin.from("lakonos_retainers").select("*").eq("pf_token", token).maybeSingle();
    retainer = r;
  }
  if (!retainer && mPaymentId) {
    const { data: r } = await supabaseAdmin.from("lakonos_retainers").select("*").eq("id", mPaymentId).maybeSingle();
    retainer = r;
  }

  // record the payment
  await supabaseAdmin.from("lakonos_payments").insert({
    retainer_id: retainer?.id || null,
    client_id: retainer?.client_id || null,
    amount,
    status: "complete",
    pf_payment_id: data.pf_payment_id || null,
    m_payment_id: mPaymentId,
    token,
    raw: data,
  });

  // mark subscribed + advance the next bill date by the cycle
  if (retainer) {
    const months = retainer.cycle === "annual" ? 12 : retainer.cycle === "quarterly" ? 3 : 1;
    const baseDate = retainer.next_bill_date ? new Date(retainer.next_bill_date) : new Date();
    baseDate.setMonth(baseDate.getMonth() + months);
    await supabaseAdmin.from("lakonos_retainers").update({
      pf_subscribed: true,
      pf_token: token || retainer.pf_token,
      last_paid_at: new Date().toISOString(),
      next_bill_date: baseDate.toISOString().slice(0, 10),
      status: "active",
    }).eq("id", retainer.id);
  }

  return new NextResponse("OK", { status: 200 });
}
