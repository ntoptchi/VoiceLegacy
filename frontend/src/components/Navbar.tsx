"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookHeart,
  MessageCircleHeart,
  Mic,
  Settings,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/record", label: "Record", icon: Mic },
  { href: "/phrases", label: "Phrases", icon: BookHeart },
  { href: "/speak", label: "Speak", icon: MessageCircleHeart },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant/30 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-content items-center justify-between gap-md px-margin py-sm">
        <Link
          href="/"
          className="group flex items-center gap-sm text-primary transition-colors hover:text-primary-container"
          aria-label="VoiceLegacy home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed transition-transform group-hover:scale-105">
            <Waves className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-headline-sm font-semibold tracking-tight">
            VoiceLegacy
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-xs md:flex"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-xs rounded-full px-md py-sm text-label-lg transition-colors",
                  active
                    ? "bg-primary-fixed/40 text-on-primary-fixed-variant"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-xs">
          <Link
            href="/dashboard"
            aria-label="Profile and settings"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
              isActive(pathname, "/dashboard")
                ? "bg-primary-fixed/40 text-on-primary-fixed-variant"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
            )}
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <nav
        aria-label="Primary mobile"
        className="flex items-center justify-around gap-xs border-t border-outline-variant/30 px-md py-xs md:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-md px-xs py-xs text-label-md transition-colors",
                active
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
