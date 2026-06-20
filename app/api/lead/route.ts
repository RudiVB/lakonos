import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { notifyNewLead, notifyLeadAutoReply } from "@/lib/notify";

export const runtime = "nodejs";
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const clip = (v: string, n = 300) => (v.length > n ? v.slice(0, n) : v);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : "");
  const name = str("name");
  const email = str("email");
  const company = str("company");
  const message = str("message");
  const honeypot = str("website");          // must stay empty for humans
  const ts = Number(body.ts) || 0;          // client render time (time-trap)

  // ---- anti-spam: pretend success but skip the insert (don't tip off bots) ----
  const tooFast = ts > 0 && Date.now() - ts < 2500; // submitted < 2.5s after render
  if (honeypot || tooFast) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // ---- validation ----
  if (!name || !email) return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });

  // ---- attribution ----
  const utm_source = clip(str("utm_source"), 120) || null;
  const utm_medium = clip(str("utm_medium"), 120) || null;
  const utm_campaign = clip(str("utm_campaign"), 120) || null;
  const referrer = clip(str("referrer"), 500) || null;
  const landing_path = clip(str("landing_path"), 500) || null;

  // derive a human-readable source channel
  let source = "website";
  if (utm_source) source = utm_source;
  else if (referrer && !/lakonos\.(com|vercel\.app)/i.test(referrer)) source = "referral";

  const { error } = await supabaseAdmin.from("lakonos_leads").insert({
    name: clip(name, 200),
    email: clip(email, 200),
    company: company ? clip(company, 200) : null,
    message: message ? clip(message, 4000) : null,
    source,
    utm_source, utm_medium, utm_campaign, referrer, landing_path,
  });
  if (error) {
    console.error("[lead] insert failed:", error.message);
    return NextResponse.json({ error: "Could not save your details." }, { status: 500 });
  }

  // owner alert + auto-reply (both no-op silently if Resend isn't configured)
  await notifyNewLead({ name, email, company, message });
  await notifyLeadAutoReply(email, name);

  return NextResponse.json({ ok: true }, { status: 201 });
}
