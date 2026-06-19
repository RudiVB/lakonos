import { redirect } from "next/navigation";
import { getClientUser } from "@/lib/client";
import PortalShell from "@/components/PortalShell";
import PortalTickets from "@/components/PortalTickets";

export const dynamic = "force-dynamic";

export default async function PortalHome() {
  const session = await getClientUser();
  if (!session) redirect("/portal/login");
  const name = session.clientName || session.clientUser.name || session.clientUser.email;
  return (
    <PortalShell name={name} active="tickets">
      <PortalTickets />
    </PortalShell>
  );
}
