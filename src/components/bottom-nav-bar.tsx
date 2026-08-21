"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, MapPin, Bookmark, CircleUser } from "lucide-react";

// Mobile-only (md:hidden) — the header's own nav row works fine at
// desktop widths and only wrapped awkwardly on phones, so this replaces
// it there instead of running both at once.
export function BottomNavBar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const accountHref = isLoggedIn ? "/account" : "/login";

  const tabs = [
    {
      href: "/dex",
      label: "Dex",
      icon: LayoutGrid,
      active: pathname.startsWith("/dex"),
    },
    {
      href: "/discover",
      label: "Map",
      icon: MapPin,
      active: pathname.startsWith("/discover"),
    },
    {
      href: "/saved",
      label: "Saved",
      icon: Bookmark,
      active: pathname.startsWith("/saved"),
    },
    {
      // Change City has no tab of its own — it lives inside Account now,
      // so a visit there still lights up this tab.
      href: accountHref,
      label: "Account",
      icon: CircleUser,
      active:
        pathname.startsWith("/account") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/change-city"),
    },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-border bg-card md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={tab.active ? "page" : undefined}
            className="flex flex-1 flex-col items-center gap-0.5 py-1.5"
          >
            <span
              className={
                tab.active
                  ? "flex h-[30px] w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
                  : "flex h-[30px] w-11 items-center justify-center rounded-2xl text-muted-foreground"
              }
            >
              <tab.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span
              className={
                tab.active
                  ? "font-heading text-[10.5px] font-semibold text-foreground"
                  : "font-heading text-[10.5px] font-semibold text-muted-foreground"
              }
            >
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
