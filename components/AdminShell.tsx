"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Tab definitions. `manage: true` = only owner/admin see it.
const TABS = [
  { href: "/admin", label: "Leads", key: "leads", manage: false },
  { href: "/admin/clients", label: "Clients", key: "clients", manage: false },
  { href: "/admin/retainers", label: "Retainers", key: "retainers", manage: true },
  { href: "/admin/tickets", label: "Tickets", key: "tickets", manage: false },
  { href: "/admin/projects", label: "Projects", key: "projects", manage: false },
  { href: "/admin/invoices", label: "Invoices", key: "invoices", manage: true },
  { href: "/admin/time", label: "Time", key: "time", manage: false },
  { href: "/admin/staff", label: "Staff", key: "staff", manage: true },
];

export default function AdminShell({
  role,
  name,
  active,
  children,
}: {
  role: string;
  name: string;
  active: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const canManage = role === "owner" || role === "admin";

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
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
            <span className="admin-who">
              {name} · {role}
            </span>
            <button className="logout-btn" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 16 }}>
        <nav className="admin-tabs">
          {TABS.filter((t) => !t.manage || canManage).map((t) => (
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
