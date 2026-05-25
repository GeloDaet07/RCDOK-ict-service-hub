// components/ui/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = "requester" | "ict_staff" | "ict_admin" | "super_admin";

interface NavbarProps {
  profile: {
    full_name: string;
    role: UserRole;
  };
  unreadCount?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_ROLES: UserRole[] = ["ict_staff", "ict_admin", "super_admin"];

const REQUESTER_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tickets/new", label: "New Request" },
  { href: "/tickets", label: "My Tickets" },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/audit", label: "Audit Logs" },
  { href: "/admin/spam", label: "Spam" },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  // Admin navbar
  adminHeader:      "bg-slate-900 border-b border-slate-800 sticky top-0 z-30",
  adminInner:       "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  adminRow:         "flex items-center justify-between h-16",
  adminBrandLabel:  "text-xs text-amber-400 font-bold tracking-widest uppercase",
  adminBrandTitle:  "text-white font-bold text-lg leading-none",
  adminBadge:       "hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-amber-600/20 text-amber-400 text-xs font-bold border border-amber-600/30",
  adminNav:         "flex items-center gap-1",
  adminLinkBase:    "px-3 py-2 rounded text-sm font-medium transition-colors",
  adminLinkActive:  "bg-white/10 text-white",
  adminLinkDefault: "text-slate-300 hover:text-white hover:bg-white/5",
  adminDivider:     "ml-4 pl-4 border-l border-white/10 flex items-center gap-2",
  adminUsername:    "text-slate-300 text-sm hidden md:block",
  adminSignOut:     "text-slate-400 hover:text-white text-sm transition-colors",

  // Requester navbar
  requesterHeader:      "bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm",
  requesterInner:       "max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between",
  requesterAvatar:      "h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 font-bold text-sm",
  requesterBrandLabel:  "text-xs text-amber-600 font-bold tracking-wide",
  requesterBrandTitle:  "text-slate-900 font-bold text-sm leading-none",
  requesterNav:         "flex items-center gap-1",
  requesterLinkBase:    "px-3 py-2 text-sm rounded transition-colors",
  requesterLinkActive:  "font-semibold text-slate-900 bg-slate-100",
  requesterLinkDefault: "font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100",
  requesterBellBase:    "h-10 w-10 flex items-center justify-center rounded-full transition-colors",
  requesterBellActive:  "bg-slate-100",
  requesterBellDefault: "hover:bg-slate-100",
  requesterBadge:       "absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-amber-600 text-white text-[10px] font-bold",
  requesterSignOut:     "ml-2 text-sm text-slate-400 hover:text-slate-600 transition-colors",
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar({ profile, unreadCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const isAdmin = ADMIN_ROLES.includes(profile.role);

  const isActive = (href: string): boolean => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/tickets/new") return pathname === "/tickets/new";
    if (href === "/tickets")
      return pathname === "/tickets" ||
        (pathname.startsWith("/tickets/") && pathname !== "/tickets/new");
    return pathname === href || pathname.startsWith(href + "/");
  };

  // if admin, display admin navbar
  if (isAdmin) {
    return (
      <header className={styles.adminHeader}>
        <div className={styles.adminInner}>
          <div className={styles.adminRow}>

            <div className="flex items-center gap-4">
              <div>
                <div className={styles.adminBrandLabel}>Diocese of Kalookan</div>
                <div className={styles.adminBrandTitle}>ICT Service Hub</div>
              </div>
              <span className={styles.adminBadge}>Admin Portal</span>
            </div>

            <nav className={styles.adminNav}>
              {ADMIN_NAV.map(({ href, label }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`${styles.adminLinkBase} ${active ? styles.adminLinkActive : styles.adminLinkDefault}`}
                  >
                    {label}
                  </Link>
                );
              })}
              <div className={styles.adminDivider}>
                <span className={styles.adminUsername}>{profile.full_name}</span>
                <Link href="/api/auth/signout" className={styles.adminSignOut}>Sign Out</Link>
              </div>
            </nav>

          </div>
        </div>
      </header>
    );
  }

  // else, display requester navbar
  return (
    <header className={styles.requesterHeader}>
      <div className={styles.requesterInner}>

        <div className="flex items-center gap-3">
          <div className={styles.requesterAvatar}>
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className={styles.requesterBrandLabel}>Diocese of Kalookan</div>
            <div className={styles.requesterBrandTitle}>ICT Service Hub</div>
          </div>
        </div>

        <nav className={styles.requesterNav}>
          {REQUESTER_NAV.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${styles.requesterLinkBase} ${active ? styles.requesterLinkActive : styles.requesterLinkDefault}`}
              >
                {label}
              </Link>
            );
          })}

          <div className="relative ml-2">
            <Link
              href="/notifications"
              aria-label="Notifications"
              aria-current={isActive("/notifications") ? "page" : undefined}
              className={`${styles.requesterBellBase} ${isActive("/notifications") ? styles.requesterBellActive : styles.requesterBellDefault}`}
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className={styles.requesterBadge}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </div>

          <Link href="/api/auth/signout" className={styles.requesterSignOut}>Sign Out</Link>
        </nav>

      </div>
    </header>
  );
}