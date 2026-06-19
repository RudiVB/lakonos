import LeadForm from "@/components/LeadForm";

export default function Home() {
  return (
    <>
      {/* ===================== NAV ===================== */}
      <nav>
        <div className="wrap">
          <span className="wordmark">
            L<span className="lam">Λ</span>KONOS
          </span>
          <a
            className="btn btn-primary nav-cta"
            href="mailto:rudi@lakonos.com?subject=Lakonos%20demo"
          >
            Book a demo
          </a>
        </div>
      </nav>

      {/* ===================== HERO ===================== */}
      <header className="hero">
        <svg className="hero-lambda" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M50 8 L18 92 M50 8 L82 92" stroke="#C39A4E" strokeWidth="9" fill="none" />
        </svg>
        <div className="wrap">
          <div className="eyebrow">Custom business automation · South Africa</div>
          <h1>Automate the work your people do by hand.</h1>
          <p className="lead">
            Lakonos builds you a system from scratch — shaped around how your business already runs —
            and lets it do the work of an entire team. Warehouse, production, quality, admin: if
            it&apos;s manual and repetitive, we automate it.
          </p>
          <div className="actions">
            <a className="btn btn-primary" href="#start">
              See it running
            </a>
            <a className="btn btn-ghost" href="#proof">
              View the proof
            </a>
          </div>

          <div className="ledger">
            <div className="stat"><div className="num">40,000</div><div className="lbl">Picks / day</div></div>
            <div className="stat"><div className="num">97%</div><div className="lbl">Pick accuracy</div></div>
            <div className="stat"><div className="num">40→24</div><div className="lbl">Staff, same output</div></div>
            <div className="stat"><div className="num">R8.5m</div><div className="lbl">Saved per year</div></div>
          </div>
        </div>
      </header>

      {/* ===================== WHY IT'S DIFFERENT ===================== */}
      <section className="block">
        <div className="wrap">
          <div className="eyebrow">Why it&apos;s different</div>
          <h2 className="head">Your business shouldn&apos;t bend to software.</h2>
          <p className="lede">
            Off-the-shelf systems force you to change how you work to fit them. Lakonos is the
            opposite — we build your system from scratch, around your processes, your rules, your
            floor. Nothing has to bend except your costs.
          </p>
          <div className="contrast">
            <div className="col off">
              <div className="ct">Off-the-shelf software</div>
              <p>
                You re-train staff, rewire your process and pay licence fees forever — all to fit
                someone else&apos;s system.
              </p>
            </div>
            <div className="col us">
              <div className="ct">The Lakonos way</div>
              <p>
                We learn how you already operate, then build your system from scratch to fit it
                exactly. Made for your business — not adapted from a template.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== THE PROBLEM ===================== */}
      <section className="block light">
        <div className="wrap">
          <div className="eyebrow">The problem</div>
          <h2 className="head">You&apos;re paying people to do what a system should.</h2>
          <p className="lede">
            Staff keying in orders. Clipboards on the floor. Stock counted by hand. Paperwork chasing
            paperwork. It&apos;s slow, it&apos;s error-prone, and every manual task is a salary — and
            a mistake waiting to happen.
          </p>
        </div>
      </section>

      {/* ===================== WHAT WE AUTOMATE ===================== */}
      <section className="block">
        <div className="wrap">
          <div className="eyebrow">What we automate</div>
          <h2 className="head">If your team does it by hand, we can automate it.</h2>
          <div className="modules">
            <div className="mod"><h3><span className="lam">Λ</span> Warehouse &amp; Fulfilment</h3><p>Picking, scanning and dispatch run themselves — accurate to the unit, no manual counts.</p></div>
            <div className="mod"><h3><span className="lam">Λ</span> Production</h3><p>Planning, scheduling and floor tracking without spreadsheets or guesswork.</p></div>
            <div className="mod"><h3><span className="lam">Λ</span> Quality &amp; Compliance</h3><p>Checks, traceability and FSSC 22000 paperwork, handled end to end.</p></div>
            <div className="mod"><h3><span className="lam">Λ</span> Maintenance</h3><p>Job cards, preventive schedules and asset tracking that trigger themselves.</p></div>
            <div className="mod"><h3><span className="lam">Λ</span> Procurement &amp; Stock</h3><p>Receiving, reordering and a stock ledger that always reconciles.</p></div>
            <div className="mod"><h3><span className="lam">Λ</span> Admin &amp; Office</h3><p>The repetitive back-office grind — data capture, reports, reconciliations — done for you.</p></div>
          </div>
          <p className="modules-note">
            Warehouse is just where most businesses start. <b>Whatever your team repeats by hand, it
            can run by itself.</b>
          </p>
        </div>
      </section>

      {/* ===================== PROOF ===================== */}
      <section className="block light" id="proof">
        <div className="wrap">
          <div className="eyebrow">Proof — this is not a prototype</div>
          <h2 className="head">The system already does the work of an entire team.</h2>
          <p className="attribution">
            Built on the system that runs a high-volume supplement manufacturer in the Eastern Cape.
          </p>
          <div className="proof-grid">
            <div className="stat"><div className="num">40,000</div><div className="lbl">Picks / day</div></div>
            <div className="stat"><div className="num">97%</div><div className="lbl">Pick accuracy</div></div>
            <div className="stat"><div className="num">40→24</div><div className="lbl">Staff, same output</div></div>
            <div className="stat"><div className="num">R8.5m</div><div className="lbl">Saved per year</div></div>
          </div>
          <p className="proof-note">
            <span className="lam">Λ</span> &nbsp;Replaced a full third-party 3PL system — entirely.
          </p>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="block">
        <div className="wrap">
          <div className="eyebrow">How it works</div>
          <h2 className="head">We build the system around you — not the other way around.</h2>
          <div className="steps">
            <div className="step"><div className="k">01</div><h3>We map how you work</h3><p>How you actually operate today — your process, your rules, your floor.</p></div>
            <div className="step"><div className="k">02</div><h3>We build it from scratch</h3><p>A system designed around your business exactly — then we install it and migrate your data.</p></div>
            <div className="step"><div className="k">03</div><h3>We run it with you</h3><p>We keep it live and improving as you grow. Fixed scope, ongoing support.</p></div>
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA + LEAD FORM ===================== */}
      <section className="cta" id="start">
        <div className="wrap">
          <h2>Ready to run lean?</h2>
          <p>
            Tell us what your team does by hand. We&apos;ll show you what it could automate — and
            book a 20-minute look at the system running live.
          </p>
          <LeadForm />
          <a className="email" href="mailto:rudi@lakonos.com">
            rudi@lakonos.com
          </a>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer>
        <div className="wrap">
          <span className="wordmark">
            L<span className="lam">Λ</span>KONOS
          </span>
          <small>One system. Whole operation. &nbsp;·&nbsp; © 2026 Lakonos</small>
        </div>
      </footer>
    </>
  );
}
