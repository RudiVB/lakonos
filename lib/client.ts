import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export type ClientUser = { id: string; client_id: string; email: string; name: string | null };

// Returns the signed-in portal client user, or null if not a client.
export async function getClientUser(): Promise<
  { user: { id: string; email: string }; clientUser: ClientUser; clientName: string } | null
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;

  const { data: cu } = await supabaseAdmin
    .from("lakonos_client_users")
    .select("id,client_id,email,name")
    .eq("id", user.id)
    .maybeSingle();
  if (!cu) return null;

  const { data: client } = await supabaseAdmin
    .from("lakonos_clients")
    .select("name")
    .eq("id", cu.client_id)
    .maybeSingle();

  return { user: { id: user.id, email: user.email }, clientUser: cu as ClientUser, clientName: client?.name || "" };
}
