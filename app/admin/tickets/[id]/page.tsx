import { redirect } from "next/navigation";
import { getStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";
import AdminShell from "@/components/AdminShell";
import TicketDetail from "@/components/TicketDetail";

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: { params: { id: string } }) {
  const session = await getStaff();
  if (!session) redirect("/admin/login");

  const { data: ticket } = await supabaseAdmin
    .from("lakonos_tickets").select("*").eq("id", params.id).maybeSingle();
  if (!ticket) redirect("/admin/tickets");

  const { data: staff } = await supabaseAdmin
    .from("lakonos_staff").select("id,name,email").eq("active", true);
  const { data: clients } = await supabaseAdmin
    .from("lakonos_clients").select("id,name");

  const name = session.staff.name || session.staff.email;
  return (
    <AdminShell role={session.staff.role} name={name} active="tickets">
      <TicketDetail ticket={ticket} staff={staff ?? []} clients={clients ?? []} />
    </AdminShell>
  );
}
