import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { notifyNewLead } from "@/lib/notify";

export const runtime = "nodejs";
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(req: NextRequest) {
  let body: { name?: string; company?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const company = (body.company || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email) return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });

  const { error } = await supabaseAdmin.from("lakonos_leads").insert({
    name, email, company: company || null, message: message || null, source: "website",
  });
  if (error) {
    console.error("[lead] insert failed:", error.message);
    return NextResponse.json({ error: "Could not save your details." }, { status: 500 });
  }

  // fire the alert email (won't block/fail the response)
  await notifyNewLead({ name, email, company, message });

  return NextResponse.json({ ok: true }, { status: 201 });
}
