"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookHeart,
  MessageCircleHeart,
  Mic,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/cn";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const authedNavItems: NavItem[] = [
  { href: "/record", label: "Record", icon: Mic },
  { href: "/phrases", label: "Phrases", icon: BookHeart },
  { href: "/speak", label: "Speak", icon: MessageCircleHeart },
];

const authedMobileItems: NavItem[] = [
  ...authedNavItems,
  { href: "/dashboard", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname() ?? "/";
  const { isLoaded, isSignedIn } = useAuth();

  const showAuthNav = isLoaded && isSignedIn;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant/30 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-content items-center justify-between gap-sm px-4 py-sm sm:px-6 md:gap-md md:px-margin">
        <Link
          href="/"
          className="group flex items-center gap-sm text-primary transition-colors hover:text-primary-container"
          aria-label="VoiceLegacy home"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed transition-transform group-hover:scale-105">
            <Image
              src="/logo.png"
              alt=""
              width={24}
              height={24}
              className="object-contain"
            />
          </span>
          <span className="text-lg font-semibold text-on-surface md:text-headline-sm">
            VoiceLegacy
          </span>
        </Link>

        {showAuthNav ? (
          <nav
            aria-label="Primary"
            className="hidden items-center gap-xs md:flex"
          >
            {authedNavItems.map((item) => {
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
        ) : null}

        <div className="flex items-center gap-sm">
          <ThemeToggle />
          {showAuthNav ? (
            <div className="hidden items-center gap-sm md:flex">
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
              <UserButton />
            </div>
          ) : isLoaded ? (
            <div className="hidden items-center gap-sm md:flex">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  variant="tertiary"
                  size="sm"
                  className="bg-[#ffd8df] text-[#6f2636] shadow-[0_8px_18px_rgba(190,76,98,0.16)] hover:bg-[#ffc2cf] hover:text-[#5a1c2a]"
                >
                  Sign up
                </Button>
              </SignUpButton>
            </div>
          ) : null}
        </div>
      </div>

      {showAuthNav ? (
        <nav
          aria-label="Primary mobile"
          className="flex items-center justify-around gap-xs border-t border-outline-variant/30 px-md py-xs md:hidden"
        >
          {authedMobileItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md px-xs py-xs text-label-md transition-colors",
                  active
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-center text-[11px] uppercase">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
