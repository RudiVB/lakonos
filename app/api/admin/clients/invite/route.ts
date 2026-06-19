import { NextResponse } from "next/server";
import { getStaff, canManageStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageStaff(s.staff.role)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

  const { client_id, email, name, password } = await req.json().catch(() => ({}));
  if (!client_id || !email || !password)
    return NextResponse.json({ error: "Client, email and a temporary password are required." }, { status: 400 });

  // create the auth user (confirmed) then link to the client
  const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { name, portal: true },
  });
  if (cErr || !created?.user)
    return NextResponse.json({ error: cErr?.message || "Could not create login." }, { status: 500 });

  const { error: lErr } = await supabaseAdmin.from("lakonos_client_users").insert({
    id: created.user.id, client_id, email, name: name || null,
  });
  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 201 });
}
