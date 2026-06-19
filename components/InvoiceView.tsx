"use client";

import { COMPANY } from "@/lib/company";

type Item = { id: string; description: string; qty: number; unit_price: number; line_total: number };
type Invoice = {
  id: string;
  number: string | null;
  status: string;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  vat: number;
  total: number;
  notes: string | null;
};
type Client = { name: string; email: string | null; phone: string | null } | null;

const rands = (n: number) =>
  "R" + (Number(n) || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InvoiceView({
  invoice,
  items,
  client,
  backHref,
}: {
  invoice: Invoice;
  items: Item[];
  client: Client;
  backHref: string;
}) {
  const bank = COMPANY.bank;
  const hasBank = bank.bankName || bank.accountNo;

  return (
    <div className="invoice-wrap">
      <div className="invoice-toolbar">
        <a href={backHref} className="btn btn-ghost mini">
          ← Back
        </a>
        <button className="btn btn-primary mini" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>

      <div className="invoice-sheet">
        {/* header */}
        <div className="inv-top">
          <div className="inv-co">
            {COMPANY.name}
            <small>
              {COMPANY.tagline}
              <br />
              {COMPANY.email}
              {COMPANY.phone ? ` · ${COMPANY.phone}` : ""}
              <br />
              {COMPANY.address}
              {COMPANY.regNo ? <><br />Reg: {COMPANY.regNo}</> : null}
              {COMPANY.vatNo ? <><br />VAT: {COMPANY.vatNo}</> : null}
            </small>
          </div>
          <div className="inv-meta">
            <span className="t">{COMPANY.vatNo ? "TAX INVOICE" : "INVOICE"}</span>
            <div>
              <strong>No:</strong> {invoice.number || invoice.id.slice(0, 8)}
            </div>
            <div>
              <strong>Issued:</strong> {invoice.issue_date}
            </div>
            {invoice.due_date && (
              <div>
                <strong>Due:</strong> {invoice.due_date}
              </div>
            )}
            <div>
              <strong>Status:</strong> {invoice.status}
            </div>
          </div>
        </div>

        {/* bill to */}
        <div className="inv-parties">
          <div>
            <h4>Bill to</h4>
            {client ? (
              <>
                <strong>{client.name}</strong>
                <br />
                {client.email}
                {client.phone ? <><br />{client.phone}</> : null}
              </>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>

        {/* line items */}
        <table className="inv-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="r">Qty</th>
              <th className="r">Unit price</th>
              <th className="r">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.description}</td>
                <td className="r">{it.qty}</td>
                <td className="r">{rands(it.unit_price)}</td>
                <td className="r">{rands(it.line_total)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "#999" }}>
                  No line items.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* totals */}
        <div className="inv-totals">
          <div className="trow">
            <span>Subtotal</span>
            <span>{rands(invoice.subtotal)}</span>
          </div>
          <div className="trow">
            <span>VAT {COMPANY.vatNo ? "(15%)" : ""}</span>
            <span>{rands(invoice.vat)}</span>
          </div>
          <div className="trow grand">
            <span>Total due</span>
            <span>{rands(invoice.total)}</span>
          </div>
        </div>

        {/* footer: notes + banking */}
        <div className="inv-foot">
          {invoice.notes && (
            <>
              <strong>Notes</strong>
              <div style={{ whiteSpace: "pre-wrap", marginBottom: 10 }}>{invoice.notes}</div>
            </>
          )}
          {hasBank && (
            <>
              <strong>Banking details</strong>
              <div>
                {bank.accountName} {bank.bankName ? `· ${bank.bankName}` : ""}
                {bank.accountNo ? ` · Acc ${bank.accountNo}` : ""}
                {bank.branchCode ? ` · Branch ${bank.branchCode}` : ""}
              </div>
            </>
          )}
          <div style={{ marginTop: 12, color: "#888" }}>Thank you for your business.</div>
        </div>
      </div>
    </div>
  );
}
