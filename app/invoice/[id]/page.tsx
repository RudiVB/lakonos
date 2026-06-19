import { redirect } from "next/navigation";
import { getStaff } from "@/lib/staff";
import { getClientUser } from "@/lib/client";
import { supabaseAdmin } from "@/lib/supabaseServer";
import InvoiceView from "@/components/InvoiceView";

export const dynamic = "force-dynamic";

export default async function InvoicePrint({ params }: { params: { id: string } }) {
  const { data: invoice } = await supabaseAdmin.from("lakonos_invoices").select("*").eq("id", params.id).maybeSingle();

  const staff = await getStaff();
  let backHref = "/admin/invoices";
  let allowed = false;

  if (staff) {
    allowed = !!invoice;
  } else {
    const cu = await getClientUser();
    if (!cu) redirect("/portal/login");
    backHref = "/portal/billing";
    allowed = !!invoice && invoice.client_id === cu.clientUser.client_id && invoice.status !== "draft";
  }
  if (!invoice || !allowed) redirect(backHref);

  const { data: items } = await supabaseAdmin.from("lakonos_invoice_items").select("*").eq("invoice_id", invoice.id);
  let client = null;
  if (invoice.client_id) {
    const { data: c } = await supabaseAdmin.from("lakonos_clients").select("name,email,phone").eq("id", invoice.client_id).maybeSingle();
    client = c;
  }
  return <InvoiceView invoice={invoice} items={items ?? []} client={client} backHref={backHref} />;
}
