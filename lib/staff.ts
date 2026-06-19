import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export type Staff = {
  id: string;
  email: string;
  name: string | null;
  role: "owner" | "admin" | "support" | "viewer";
  active: boolean;
};

// Returns the signed-in staff member, or null if not authenticated / not staff.
// Bootstraps LAKONOS_OWNER_EMAIL to 'owner' on first login.
export async function getStaff(): Promise<
  { user: { id: string; email: string }; staff: Staff } | null
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;

  // staff lookup via service role (bypasses RLS)
  let { data: staff } = await supabaseAdmin
    .from("lakonos_staff")
    .select("id,email,name,role,active")
    .eq("id", user.id)
    .maybeSingle();

  // first-login bootstrap for the owner
  if (
    !staff &&
    process.env.LAKONOS_OWNER_EMAIL &&
    user.email.toLowerCase() === process.env.LAKONOS_OWNER_EMAIL.toLowerCase()
  ) {
    const { data: created } = await supabaseAdmin
      .from("lakonos_staff")
      .insert({ id: user.id, email: user.email, name: "Owner", role: "owner" })
      .select("id,email,name,role,active")
      .single();
    staff = created ?? null;
  }

  if (!staff || !staff.active) return null;
  return { user: { id: user.id, email: user.email }, staff: staff as Staff };
}

export function canManageStaff(role: string) {
  return role === "owner" || role === "admin";
}
