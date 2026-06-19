import { redirect } from "next/navigation";
import { getClientUser } from "@/lib/client";
import PortalShell from "@/components/PortalShell";
import PortalBilling from "@/components/PortalBilling";

export const dynamic = "force-dynamic";

export default async function PortalBillingPage() {
  const session = await getClientUser();
  if (!session) redirect("/portal/login");
  const name = session.clientName || session.clientUser.name || session.clientUser.email;
  return (
    <PortalShell name={name} active="billing">
      <PortalBilling />
    </PortalShell>
  );
}
