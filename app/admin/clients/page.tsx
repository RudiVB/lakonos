import { redirect } from "next/navigation";
import { getStaff } from "@/lib/staff";
import AdminShell from "@/components/AdminShell";
import ClientsPanel from "@/components/ClientsPanel";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const session = await getStaff();
  if (!session) redirect("/admin/login");
  const name = session.staff.name || session.staff.email;
  return (
    <AdminShell role={session.staff.role} name={name} active="clients">
      <ClientsPanel />
    </AdminShell>
  );
}
