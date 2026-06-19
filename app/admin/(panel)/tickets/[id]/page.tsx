import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseServer";
import TicketDetail from "@/components/TicketDetail";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  const { data: ticket } = await supabaseAdmin.from("lakonos_tickets").select("*").eq("id", params.id).maybeSingle();
  if (!ticket) redirect("/admin/tickets");
  const { data: staff } = await supabaseAdmin.from("lakonos_staff").select("id,name,email").eq("active", true);
  const { data: clients } = await supabaseAdmin.from("lakonos_clients").select("id,name");
  return <TicketDetail ticket={ticket} staff={staff ?? []} clients={clients ?? []} />;
}
