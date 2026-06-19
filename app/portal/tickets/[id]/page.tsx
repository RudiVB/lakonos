import { redirect } from "next/navigation";
import { getClientUser } from "@/lib/client";
import { supabaseAdmin } from "@/lib/supabaseServer";
import PortalShell from "@/components/PortalShell";
import PortalTicketDetail from "@/components/PortalTicketDetail";

export const dynamic = "force-dynamic";

export default async function PortalTicketPage({ params }: { params: { id: string } }) {
  const session = await getClientUser();
  if (!session) redirect("/portal/login");

  const { data: ticket } = await supabaseAdmin
    .from("lakonos_tickets").select("id,subject,client_id").eq("id", params.id).maybeSingle();
  // ticket must belong to this client
  if (!ticket || ticket.client_id !== session.clientUser.client_id) redirect("/portal");

  const name = session.clientName || session.clientUser.name || session.clientUser.email;
  return (
    <PortalShell name={name} active="tickets">
      <PortalTicketDetail ticketId={ticket.id} subject={ticket.subject} />
    </PortalShell>
  );
}
