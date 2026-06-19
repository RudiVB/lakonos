import { redirect } from "next/navigation";
import { getStaff } from "@/lib/staff";
import AdminShell from "@/components/AdminShell";

export const dynamic = "force-dynamic";

// Runs once when entering the admin section; preserved across tab navigation.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaff();
  if (!session) redirect("/admin/login");
  const name = session.staff.name || session.staff.email;
  return (
    <AdminShell role={session.staff.role} name={name}>
      {children}
    </AdminShell>
  );
}
