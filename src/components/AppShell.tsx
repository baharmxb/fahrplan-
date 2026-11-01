"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/", label: "امروز", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/dashboard", label: "داشبورد", icon: "M4 19V11M10 19V5M16 19v-6M21 19H3" },
  { href: "/plan", label: "برنامه", icon: "M8 3v18M8 7h9l3 3-3 3H8" },
  { href: "/lessons", label: "درس‌ها", icon: "M5 4h9a5 5 0 0 1 5 5v11H10a5 5 0 0 0-5-5z" },
  { href: "/reports", label: "گزارش", icon: "M5 20V4M5 20h15M9 16l4-5 3 3 4-6" },
];

export function storageLabel(status: string, repo: string | null) {
  if (!repo) return "ذخیره در همین دستگاه";
  if (status === "syncing") return "در حال ذخیره در گیت‌هاب";
  if (status === "error") return "ذخیره در گیت‌هاب ناموفق بود";
  return "ذخیره در گیت‌هاب";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = pathname.replace(/\/$/, "") || "/";
  const isActive = (href: string) => (href === "/" ? current === "/" : current.startsWith(href));

  return (
    <div className="shell">
      <main id="content">{children}</main>
      <nav className="tabbar" aria-label="بخش‌های اصلی">
        {NAV.map((item) => (
          <Link prefetch={false} key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
