import { Resend } from "resend";

// Emails a lead alert if RESEND_API_KEY is set. No-ops silently otherwise,
// so the public form never fails just because email isn't configured yet.
export async function notifyNewLead(lead: {
  name: string;
  email: string;
  company?: string | null;
  message?: string | null;
}) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LAKONOS_ALERT_EMAIL || process.env.LAKONOS_OWNER_EMAIL;
  if (!key || !to) return; // not configured -> skip

  try {
    const resend = new Resend(key);
    await resend.emails.send({
      from: process.env.LAKONOS_ALERT_FROM || "Lakonos <onboarding@resend.dev>",
      to,
      subject: `New lead: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
      text:
        `New lead from the website\n\n` +
        `Name:    ${lead.name}\n` +
        `Email:   ${lead.email}\n` +
        `Company: ${lead.company || "-"}\n\n` +
        `Message:\n${lead.message || "-"}\n\n` +
        `Dashboard: https://lakonos.vercel.app/admin`,
    });
  } catch (e) {
    console.error("[notify] lead email failed:", (e as Error).message);
  }
}

// Alerts staff when a client opens or replies to a ticket (no-op without Resend).
export async function notifyStaffClientTicket(subject: string, clientName: string, isReply = false) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LAKONOS_ALERT_EMAIL || process.env.LAKONOS_OWNER_EMAIL;
  if (!key || !to) return;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    await resend.emails.send({
      from: process.env.LAKONOS_ALERT_FROM || "Lakonos <onboarding@resend.dev>",
      to,
      subject: `${isReply ? "Client reply" : "New client ticket"}: ${subject} — ${clientName}`,
      text: `${clientName} ${isReply ? "replied to" : "opened"} a ticket: ${subject}\n\nDashboard: https://lakonos.vercel.app/admin/tickets`,
    });
  } catch (e) {
    console.error("[notify] staff ticket alert failed:", (e as Error).message);
  }
}
