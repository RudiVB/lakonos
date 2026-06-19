import { NextResponse } from "next/server";
import { getStaff, canManageStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";

// list staff (any staff may view)
export async function GET() {
  const session = await getStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("lakonos_staff")
    .select("id,email,name,role,active,created_at")
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ staff: data ?? [], me: session.staff });
}

// add staff (owner/admin only): creates the auth user + staff row
export async function POST(req: Request) {
  const session = await getStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageStaff(session.staff.role)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

  const { email, name, role, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and a temporary password are required." }, { status: 400 });
  }
  const allowed = ["admin", "support", "viewer"];
  const finalRole = allowed.includes(role) ? role : "support";

  const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (cErr || !created?.user) {
    return NextResponse.json({ error: cErr?.message || "Could not create user." }, { status: 500 });
  }

  const { error: sErr } = await supabaseAdmin.from("lakonos_staff").insert({
    id: created.user.id, email, name: name || null, role: finalRole,
  });
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 201 });
}
