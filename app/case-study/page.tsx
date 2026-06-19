export const metadata = {
  title: "Case Study — Replacing a 3PL · Lakonos",
  description:
    "How Lakonos replaced a third-party logistics provider with a custom system that ships 40,000 orders a day at 97% accuracy — with fewer people.",
};

export default function CaseStudy() {
  return (
    <main className="cs-wrap">
      <a className="cs-back" href="/">
        ← Back to Lakonos
      </a>

      {/* hero */}
      <header className="cs-hero">
        <div className="cs-eyebrow cs-reveal">Case study · Manufacturing &amp; fulfilment</div>
        <h1 className="cs-reveal">How one custom system replaced a 3PL and now ships 40,000 orders a day</h1>
        <p className="cs-reveal">
          A high-volume supplement manufacturer was paying a third-party logistics provider to run its
          warehouse — slowly, expensively, and with no real control. Lakonos replaced the entire operation
          with a system built from scratch. Same building. Fewer people. Far more output.
        </p>
      </header>

      {/* results at a glance */}
      <section className="cs-stats">
        <div className="cs-stat cs-reveal"><div className="cs-num">40,000</div><div className="l">Picks / day</div></div>
        <div className="cs-stat cs-reveal"><div className="cs-num">97%</div><div className="l">Pick accuracy</div></div>
        <div className="cs-stat cs-reveal"><div className="cs-num">40→24</div><div className="l">Staff, same output</div></div>
        <div className="cs-stat cs-reveal"><div className="cs-num">R8.5m</div><div className="l">Saved / year</div></div>
        <div className="cs-stat cs-reveal"><div className="cs-num">~700</div><div className="l">SKUs</div></div>
        <div className="cs-stat cs-reveal"><div className="cs-num">5</div><div className="l">Sales channels</div></div>
      </section>

      {/* challenge */}
      <section className="cs-sec cs-reveal">
        <h2>The challenge</h2>
        <p>
          The warehouse was outsourced to a third-party logistics provider running generic, off-the-shelf
          software. On paper that sounds safe. In practice it meant no control over throughput or accuracy,
          manual work everywhere, errors that triggered credits and re-ships, and a per-order meter that never
          stopped. The business was paying a premium to be slow — and to be wrong.
        </p>
      </section>

      {/* approach */}
      <section className="cs-sec cs-reveal">
        <h2>What we did</h2>
        <p>Lakonos didn&apos;t install a product. We built the operation a system that fits it exactly.</p>
        <ul className="cs-list">
          <li>
            <b>Mapped how the floor actually worked</b> — the real process, rules and bottlenecks, not a
            vendor&apos;s assumptions.
          </li>
          <li>
            <b>Built it from scratch</b> — picking, packing, dispatch, stock, production and quality — then
            installed it and migrated the data off the 3PL.
          </li>
          <li>
            <b>Run it and keep improving it</b> as the business grows.
          </li>
        </ul>
      </section>

      {/* what we built */}
      <section className="cs-sec cs-reveal">
        <h2>What we built</h2>
        <p>One connected system covering the whole operation:</p>
        <div className="cs-build">
          <div className="cs-card cs-reveal"><h3><span className="lam">Λ</span> Warehouse &amp; fulfilment</h3><p>Barcode picking, packing and dispatch with FEFO/FIFO allocation, live pickface replenishment and rolling cycle counts.</p></div>
          <div className="cs-card cs-reveal"><h3><span className="lam">Λ</span> Production planning</h3><p>Demand-driven allocation, a plan-builder, and factory-floor displays telling each station what to make next.</p></div>
          <div className="cs-card cs-reveal"><h3><span className="lam">Λ</span> Quality &amp; compliance</h3><p>FSSC 22000 paperwork, full batch traceability, and non-conformance / corrective-action workflows.</p></div>
          <div className="cs-card cs-reveal"><h3><span className="lam">Λ</span> Maintenance</h3><p>Job cards, preventive schedules and QR-coded asset tracking that trigger themselves.</p></div>
          <div className="cs-card cs-reveal"><h3><span className="lam">Λ</span> Procurement &amp; stock</h3><p>Receiving, reordering and a stock ledger that always reconciles.</p></div>
          <div className="cs-card cs-reveal"><h3><span className="lam">Λ</span> Sales &amp; visibility</h3><p>A field-sales app, live wall dashboards for every department, and five online stores feeding straight into fulfilment.</p></div>
        </div>
      </section>

      {/* results */}
      <section className="cs-sec cs-reveal">
        <h2>The results</h2>
        <p>Bringing the warehouse in-house onto a purpose-built system changed the economics of the whole business:</p>
        <ul className="cs-list">
          <li><b>40,000 picks a day</b> — more throughput than the outsourced operation ever delivered.</li>
          <li><b>97% pick accuracy</b>, with every pick scanned and verified instead of eyeballed.</li>
          <li>The same daily output now runs with <b>24 people instead of 40</b> — the system does the repetitive work.</li>
          <li><b>R8.5 million a year</b> out of the cost base, between retired 3PL fees and errors that no longer happen.</li>
          <li>A full third-party logistics provider, <b>replaced entirely.</b></li>
        </ul>
      </section>

      {/* quote */}
      <section className="cs-reveal">
        <blockquote className="cs-quote">
          “We went from having no visibility and paying for every mistake, to running the whole warehouse
          ourselves — faster, with fewer people, and knowing every order is right.”
          <span className="by">— Operations lead</span>
        </blockquote>
      </section>

      {/* CTA */}
      <section className="cs-cta cs-reveal">
        <h2>If your team does it by hand, it can run by itself.</h2>
        <p>Tell us what your team repeats by hand — we&apos;ll show you what we&apos;d automate, and what it would cost.</p>
        <a className="btn btn-primary" href="/#start">
          Get in touch
        </a>
      </section>
    </main>
  );
}
