import { redirect } from "next/navigation";
import { getStaff, canManageStaff } from "@/lib/staff";
import AdminShell from "@/components/AdminShell";
import RetainersPanel from "@/components/RetainersPanel";

export const dynamic = "force-dynamic";

export default async function RetainersPage() {
  const session = await getStaff();
  if (!session) redirect("/admin/login");
  if (!canManageStaff(session.staff.role)) redirect("/admin");
  const name = session.staff.name || session.staff.email;
  return (
    <AdminShell role={session.staff.role} name={name} active="retainers">
      <RetainersPanel />
    </AdminShell>
  );
}
