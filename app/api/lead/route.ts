import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs"; // service-role key requires the Node runtime

// Basic email shape check
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

  // validate
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  // insert
  const { error } = await supabaseAdmin.from("leads").insert({
    name,
    email,
    company: company || null,
    message: message || null,
    source: "website",
  });

  if (error) {
    console.error("[lead] insert failed:", error.message);
    return NextResponse.json({ error: "Could not save your details." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
