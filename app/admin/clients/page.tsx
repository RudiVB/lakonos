import { redirect } from "next/navigation";
import { getStaff } from "@/lib/staff";
import AdminShell from "@/components/AdminShell";
import ClientsPanel from "@/components/ClientsPanel";
import PortalInvite from "@/components/PortalInvite";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const session = await getStaff();
  if (!session) redirect("/admin/login");
  const name = session.staff.name || session.staff.email;
  const canManage = session.staff.role === "owner" || session.staff.role === "admin";
  return (
    <AdminShell role={session.staff.role} name={name} active="clients">
      <ClientsPanel />
      {canManage && <PortalInvite />}
    </AdminShell>
  );
}
