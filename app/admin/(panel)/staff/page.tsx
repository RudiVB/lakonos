import { redirect } from "next/navigation";
import { getStaff, canManageStaff } from "@/lib/staff";
import StaffPanel from "@/components/StaffPanel";

export const dynamic = "force-dynamic";

export default async function Page() {
  const s = await getStaff();
  if (s && !canManageStaff(s.staff.role)) redirect("/admin");
  return <StaffPanel />;
}
