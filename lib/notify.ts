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

// Auto-replies to the lead so they get an instant acknowledgement.
// Requires a VERIFIED sending domain in LAKONOS_AUTOREPLY_FROM (e.g.
// "Lakonos <hello@lakonos.com>") — skips otherwise, since Resend's sandbox
// sender can't deliver to arbitrary external addresses.
export async function notifyLeadAutoReply(toEmail: string | null, name: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.LAKONOS_AUTOREPLY_FROM;
  if (!key || !from || !toEmail) return;

  const first = (name || "there").split(" ")[0];
  try {
    const resend = new Resend(key);
    await resend.emails.send({
      from,
      to: toEmail,
      replyTo: process.env.LAKONOS_ALERT_EMAIL || process.env.LAKONOS_OWNER_EMAIL || undefined,
      subject: "Thanks — we’ve got your request",
      text:
        `Hi ${first},\n\n` +
        `Thanks for reaching out to Lakonos. We’ve received your request and will get back to you within one business day with next steps.\n\n` +
        `In the meantime, if it’s quicker, just reply to this email and tell us a bit more about what your team does by hand today.\n\n` +
        `— Lakonos\n` +
        `Custom business automation`,
    });
  } catch (e) {
    console.error("[notify] auto-reply failed:", (e as Error).message);
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

// Emails the client when staff post a (non-internal) reply (no-op without Resend).
export async function notifyClientTicketReply(toEmail: string | null, subject: string, body: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !toEmail) return;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://lakonos.vercel.app";
    await resend.emails.send({
      from: process.env.LAKONOS_ALERT_FROM || "Lakonos <onboarding@resend.dev>",
      to: toEmail,
      subject: `Re: ${subject}`,
      text: `${body}\n\n—\nView the full conversation and reply in your portal:\n${base}/portal`,
    });
  } catch (e) {
    console.error("[notify] client reply failed:", (e as Error).message);
  }
}
