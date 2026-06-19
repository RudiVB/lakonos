import { NextResponse } from "next/server";
import { getStaff, canManageStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";
export const runtime = "nodejs";

export async function GET() {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("lakonos_invoices").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoices: data ?? [] });
}

// create invoice + line items; totals computed server-side (optional 15% VAT)
export async function POST(req: Request) {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageStaff(s.staff.role)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const items: { description: string; qty: number; unit_price: number }[] = Array.isArray(b.items) ? b.items : [];

  let subtotal = 0;
  const rows = items
    .filter((it) => (it.description || "").trim() !== "")
    .map((it) => {
      const qty = Number(it.qty) || 0;
      const unit = Number(it.unit_price) || 0;
      const line = Math.round(qty * unit * 100) / 100;
      subtotal += line;
      return { description: it.description, qty, unit_price: unit, line_total: line };
    });
  subtotal = Math.round(subtotal * 100) / 100;
  const vat = b.no_vat ? 0 : Math.round(subtotal * 0.15 * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;

  const { data: inv, error } = await supabaseAdmin.from("lakonos_invoices").insert({
    client_id: b.client_id || null, number: b.number || null, status: "draft",
    due_date: b.due_date || null, notes: b.notes || null, subtotal, vat, total,
  }).select("id").single();
  if (error || !inv) return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });

  if (rows.length) {
    const { error: iErr } = await supabaseAdmin.from("lakonos_invoice_items")
      .insert(rows.map((r) => ({ ...r, invoice_id: inv.id })));
    if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: inv.id }, { status: 201 });
}
