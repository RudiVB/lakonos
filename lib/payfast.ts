import crypto from "crypto";

// sandbox by default; set PAYFAST_MODE=live for production
const MODE = process.env.PAYFAST_MODE === "live" ? "live" : "sandbox";
const HOST = MODE === "live" ? "https://www.payfast.co.za" : "https://sandbox.payfast.co.za";

export const payfastProcessUrl = `${HOST}/eng/process`;
const validateUrl = `${HOST}/eng/query/validate`;

// true only when merchant credentials are present
export const payfastConfigured = () =>
  !!(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY);

// PHP-style urlencode (spaces -> '+', uppercase hex) used for the signature string
function pfEncode(v: string) {
  return encodeURIComponent(v.trim())
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

// md5 signature over ordered name=value pairs (+ optional passphrase)
function signature(pairs: [string, string][]) {
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  let str = pairs
    .filter(([, v]) => v !== "" && v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${pfEncode(String(v))}`)
    .join("&");
  if (passphrase) str += `&passphrase=${pfEncode(passphrase)}`;
  return crypto.createHash("md5").update(str).digest("hex");
}

// PayFast frequency code from a retainer cycle
export function freqFromCycle(cycle: string) {
  return cycle === "annual" ? 6 : cycle === "quarterly" ? 4 : 3; // 3 = monthly
}

// Build the signed subscription form fields for a retainer.
// The browser auto-submits these to payfastProcessUrl.
export function buildSubscriptionFields(opts: {
  mPaymentId: string;
  amount: number;
  itemName: string;
  frequency: number;
  billingDate: string; // YYYY-MM-DD, today or future
  nameFirst?: string;
  email?: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}): { url: string; fields: Record<string, string> } {
  const amt = (Number(opts.amount) || 0).toFixed(2);
  // ORDER MATTERS — must match PayFast's documented field order for the signature
  const ordered: [string, string][] = [
    ["merchant_id", process.env.PAYFAST_MERCHANT_ID || ""],
    ["merchant_key", process.env.PAYFAST_MERCHANT_KEY || ""],
    ["return_url", opts.returnUrl],
    ["cancel_url", opts.cancelUrl],
    ["notify_url", opts.notifyUrl],
    ["name_first", opts.nameFirst || ""],
    ["email_address", opts.email || ""],
    ["m_payment_id", opts.mPaymentId],
    ["amount", amt],
    ["item_name", opts.itemName],
    ["subscription_type", "1"],
    ["billing_date", opts.billingDate],
    ["recurring_amount", amt],
    ["frequency", String(opts.frequency)],
    ["cycles", "0"], // 0 = until cancelled
  ];
  const sig = signature(ordered);
  const fields: Record<string, string> = {};
  for (const [k, v] of ordered) if (v !== "") fields[k] = v;
  fields["signature"] = sig;
  return { url: payfastProcessUrl, fields };
}

// Validate an incoming ITN: confirm with PayFast (authoritative) + merchant match.
export async function validateItn(rawBody: string): Promise<{ ok: boolean; data: Record<string, string> }> {
  const data: Record<string, string> = {};
  for (const kv of rawBody.split("&")) {
    const i = kv.indexOf("=");
    if (i < 0) continue;
    const k = decodeURIComponent(kv.slice(0, i).replace(/\+/g, " "));
    data[k] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, " "));
  }

  // merchant id must match ours
  if (process.env.PAYFAST_MERCHANT_ID && data["merchant_id"] !== process.env.PAYFAST_MERCHANT_ID) {
    return { ok: false, data };
  }

  // server-to-server confirmation (fail closed if unreachable)
  try {
    const res = await fetch(validateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: rawBody,
    });
    const text = (await res.text()).trim().toUpperCase();
    if (!text.startsWith("VALID")) return { ok: false, data };
  } catch {
    return { ok: false, data };
  }

  return { ok: true, data };
}
