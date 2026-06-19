import LeadForm from "@/components/LeadForm";

export default function Home() {
  return (
    <>
      {/* ===================== NAV ===================== */}
      <nav className="site-nav">
        <div className="wrap">
          <span className="wordmark">
            L<span className="lam">Λ</span>KONOS
          </span>
          <div className="nav-links">
            <a href="#sizes">What we do</a>
            <a href="#proof">Proof</a>
            <a href="#how">How it works</a>
            <a href="/portal/login">Client login</a>
            <a className="btn btn-primary nav-cta" href="#start">
              Get a free quote
            </a>
          </div>
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
            From a single painful spreadsheet to a system that runs your entire operation — Lakonos
            builds it from scratch, around how you already work. <b>No project too small. None too big.</b>
          </p>
          <div className="actions">
            <a className="btn btn-primary" href="#start">
              Get a free quote
            </a>
            <a className="btn btn-ghost" href="#proof">
              See the proof
            </a>
          </div>
          <p className="trust">
            Free quote &nbsp;·&nbsp; No obligation &nbsp;·&nbsp; <b>We reply within one business day</b>
          </p>

          <div className="ledger">
            <div className="stat"><div className="num">40,000</div><div className="lbl">Picks / day</div></div>
            <div className="stat"><div className="num">97%</div><div className="lbl">Pick accuracy</div></div>
            <div className="stat"><div className="num">40→24</div><div className="lbl">Staff, same output</div></div>
            <div className="stat"><div className="num">R8.5m</div><div className="lbl">Saved per year</div></div>
          </div>
        </div>
      </header>

      {/* ===================== NO PROJECT TOO SMALL/BIG ===================== */}
      <section className="block" id="sizes">
        <div className="wrap">
          <div className="eyebrow">No project too small or too big</div>
          <h2 className="head">Start with one task. Or hand us the whole operation.</h2>
          <p className="lede">
            Most shops only want big, long retainers. We don&apos;t. Whether it&apos;s killing one
            manual job or replacing an entire 3PL, we&apos;ll build it — and quote it fast.
          </p>
          <div className="modules">
            <div className="mod">
              <span className="tier">Small</span>
              <h3><span className="lam">Λ</span> A quick automation</h3>
              <p>Kill one manual task — an auto-report, a sync between two tools, a spreadsheet that fills itself. Often live in days.</p>
            </div>
            <div className="mod">
              <span className="tier">Mid-size</span>
              <h3><span className="lam">Λ</span> A custom tool</h3>
              <p>A focused app for one team — stock, scheduling, data capture, dispatch — built to fit your process exactly.</p>
            </div>
            <div className="mod">
              <span className="tier">Large</span>
              <h3><span className="lam">Λ</span> A full system</h3>
              <p>Your entire operation on one platform: warehouse, production, quality, maintenance, admin — the lot.</p>
            </div>
          </div>
          <p className="modules-note">
            Not sure which you need? <b>That&apos;s what the free quote is for.</b>
          </p>
        </div>
      </section>

      {/* ===================== WHY IT'S DIFFERENT ===================== */}
      <section className="block light">
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
      <section className="block">
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
      <section className="block light" id="services">
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
      <section className="block" id="proof">
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
          <div className="actions" style={{ marginTop: 28 }}>
            <a className="btn btn-ghost" href="/case-study">
              Read the full case study
            </a>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS (fast quote) ===================== */}
      <section className="block light" id="how">
        <div className="wrap">
          <div className="eyebrow">How it works</div>
          <h2 className="head">From manual to automated — fast.</h2>
          <div className="steps">
            <div className="step"><div className="k">01</div><h3>Tell us what&apos;s manual</h3><p>Two minutes — describe the task or process eating your team&apos;s time. Big or small.</p></div>
            <div className="step"><div className="k">02</div><h3>Get a fast, fixed quote</h3><p>We scope it and send a clear, fixed-price quote — usually within days. No obligation, no jargon.</p></div>
            <div className="step"><div className="k">03</div><h3>We build it and run it</h3><p>Built from scratch around your business, installed, and kept improving as you grow.</p></div>
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA + QUOTE FORM ===================== */}
      <section className="cta" id="start">
        <div className="wrap">
          <h2>Get your free quote.</h2>
          <p>
            Tell us what your team does by hand. We&apos;ll reply within one business day with what
            we&apos;d automate and a fixed price — whether it&apos;s a one-day job or your whole operation.
          </p>
          <LeadForm />
          <p className="trust">
            Free &nbsp;·&nbsp; Fixed price &nbsp;·&nbsp; No obligation
          </p>
          <a className="email" href="mailto:rudi@lakonos.com">
            rudi@lakonos.com
          </a>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer>
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <span className="wordmark">
              L<span className="lam">Λ</span>KONOS
            </span>
            <p>
              Custom business automation for South African operators. From one manual task to your
              whole operation — built from scratch to fit how you already work.
            </p>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <a href="#sizes">What we do</a>
            <a href="#services">What we automate</a>
            <a href="#proof">Proof</a>
            <a href="/case-study">Case study</a>
            <a href="#how">How it works</a>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <a href="#start">Get a quote</a>
            <a href="/portal/login">Client login</a>
            <a href="/admin/login">Staff login</a>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:rudi@lakonos.com">rudi@lakonos.com</a>
            <span className="foot-muted">South Africa</span>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <small>
            © 2026 Lakonos &nbsp;·&nbsp; <a href="/privacy">Privacy</a> &nbsp;·&nbsp;{" "}
            <a href="/terms">Terms</a>
          </small>
        </div>
      </footer>
    </>
  );
}