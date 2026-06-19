import { getStaff } from "@/lib/staff";
import ClientsPanel from "@/components/ClientsPanel";
import PortalInvite from "@/components/PortalInvite";

export const dynamic = "force-dynamic";

export default async function Page() {
  const s = await getStaff();
  const canManage = s?.staff.role === "owner" || s?.staff.role === "admin";
  return (
    <>
      <ClientsPanel />
      {canManage && <PortalInvite />}
    </>
  );
}
