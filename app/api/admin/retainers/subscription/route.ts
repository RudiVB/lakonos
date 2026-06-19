import { NextResponse } from "next/server";
import { getStaff, canManageStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { manageSubscription, payfastConfigured } from "@/lib/payfast";
export const runtime = "nodejs";

// body: { retainer_id, action: 'pause' | 'resume' | 'cancel' }
export async function POST(req: Request) {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageStaff(s.staff.role)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  if (!payfastConfigured()) return NextResponse.json({ error: "Billing is not configured." }, { status: 400 });

  const { retainer_id, action } = await req.json().catch(() => ({}));
  if (!retainer_id || !["pause", "resume", "cancel"].includes(action))
    return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const { data: ret } = await supabaseAdmin.from("lakonos_retainers").select("*").eq("id", retainer_id).maybeSingle();
  if (!ret) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!ret.pf_token) return NextResponse.json({ error: "This retainer has no active PayFast subscription." }, { status: 400 });

  const pfAction = action === "resume" ? "unpause" : (action as "pause" | "cancel");
  const result = await manageSubscription(ret.pf_token, pfAction);
  if (!result.ok) return NextResponse.json({ error: `PayFast rejected the request: ${result.body || result.status}` }, { status: 502 });

  const patch =
    action === "cancel"
      ? { status: "cancelled", pf_subscribed: false }
      : action === "pause"
      ? { status: "paused" }
      : { status: "active" };
  await supabaseAdmin.from("lakonos_retainers").update(patch).eq("id", ret.id);
  return NextResponse.json({ ok: true });
}
