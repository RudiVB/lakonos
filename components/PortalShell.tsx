"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { href: "/portal", label: "Support", key: "tickets" },
  { href: "/portal/billing", label: "Billing", key: "billing" },
];

export default function PortalShell({
  name,
  active,
  children,
}: {
  name: string;
  active: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <div>
      <div className="admin-bar">
        <div className="wrap">
          <span className="wordmark">
            L<span className="lam">Λ</span>KONOS
          </span>
          <div className="admin-nav">
            <span className="admin-who">{name}</span>
            <button className="logout-btn" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 16 }}>
        <nav className="admin-tabs">
          {TABS.map((t) => (
            <Link key={t.key} href={t.href} className={active === t.key ? "on" : ""}>
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="admin-main">
        <div className="wrap">{children}</div>
      </div>
    </div>
  );
}
