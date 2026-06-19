import { NextResponse } from "next/server";
import { getStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabaseServer";
export const runtime = "nodejs";

export async function GET() {
  const s = await getStaff();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // pull everything we need in parallel
  const [leadsR, ticketsR, retR, invR, cliR, timeR] = await Promise.all([
    supabaseAdmin.from("lakonos_leads").select("id,name,company,handled,created_at").order("created_at", { ascending: false }),
    supabaseAdmin.from("lakonos_tickets").select("id,subject,status,priority,updated_at").order("updated_at", { ascending: false }),
    supabaseAdmin.from("lakonos_retainers").select("amount,cycle,status"),
    supabaseAdmin.from("lakonos_invoices").select("total,status"),
    supabaseAdmin.from("lakonos_clients").select("id,status"),
    supabaseAdmin.from("lakonos_time_entries").select("minutes,entry_date"),
  ]);

  const leads = leadsR.data ?? [];
  const tickets = ticketsR.data ?? [];
  const retainers = retR.data ?? [];
  const invoices = invR.data ?? [];
  const clients = cliR.data ?? [];
  const time = timeR.data ?? [];

  // MRR = monthly-equivalent of active retainers
  const mrr = retainers
    .filter((r) => r.status === "active")
    .reduce((sum, r) => sum + (r.cycle === "annual" ? r.amount / 12 : r.cycle === "quarterly" ? r.amount / 3 : r.amount), 0);

  const month = new Date().toISOString().slice(0, 7);
  const metrics = {
    newLeads: leads.filter((l) => !l.handled).length,
    openTickets: tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length,
    mrr: Math.round(mrr * 100) / 100,
    outstanding: Math.round(invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s2, i) => s2 + Number(i.total), 0) * 100) / 100,
    activeClients: clients.filter((c) => c.status === "active").length,
    monthHours: Math.round((time.filter((t) => (t.entry_date || "").startsWith(month)).reduce((s2, t) => s2 + t.minutes, 0) / 60) * 10) / 10,
  };

  return NextResponse.json({
    metrics,
    recentLeads: leads.slice(0, 5),
    recentTickets: tickets.slice(0, 6),
  });
}
