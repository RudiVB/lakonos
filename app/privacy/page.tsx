export const metadata = { title: "Privacy Policy · Lakonos" };

export default function Privacy() {
  return (
    <div className="legal">
      <a className="back" href="/">← Back to Lakonos</a>
      <h1>Privacy Policy</h1>
      <p className="upd">Last updated: June 2026</p>

      <p>
        Lakonos (&quot;we&quot;, &quot;us&quot;) builds and operates custom business-automation systems for our
        clients. This policy explains what personal information we collect, why, and how we look after it. We
        process personal information in line with South Africa&apos;s Protection of Personal Information Act (POPIA).
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><b>Enquiries:</b> the name, email, company and message you submit through our contact form.</li>
        <li><b>Client accounts:</b> contact details and login information for clients using our portal.</li>
        <li><b>Support tickets:</b> the content of requests and messages you send us.</li>
        <li><b>Billing:</b> payment and subscription details, processed securely by our payment provider (PayFast). We do not store your card details.</li>
        <li><b>Technical:</b> basic session data needed to keep you logged in.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To respond to enquiries and provide our services.</li>
        <li>To operate the client portal, support and billing.</li>
        <li>To send service-related communication (for example, replies to your support tickets).</li>
        <li>To meet our legal and accounting obligations.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We do not sell your information. We share it only with the service providers that run our platform —
        our database and hosting providers, our payment provider (PayFast), and our email provider — and only as
        needed to deliver the service, or where required by law.
      </p>

      <h2>Security &amp; retention</h2>
      <p>
        Access to your data is restricted and protected by authentication and row-level security. We keep
        personal information only as long as needed for the purposes above or as required by law, then delete or
        anonymise it.
      </p>

      <h2>Your rights</h2>
      <p>
        Under POPIA you may request access to, correction of, or deletion of your personal information, and you
        may object to certain processing. To exercise these rights, contact us at{" "}
        <a href="mailto:rudi@lakonos.com">rudi@lakonos.com</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email <a href="mailto:rudi@lakonos.com">rudi@lakonos.com</a>.
      </p>
    </div>
  );
}
