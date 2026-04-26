"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export type AppUser = {
  id: string;
  clerkUserId: string;
  communicationStyle: string;
  audience: string | null;
  voiceId: string | null;
  voiceStatus: string;
};

export function useRequireUser(): AppUser | null {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) {
          if (res.status === 404) {
            router.replace("/consent");
            return;
          }
          return;
        }
        const data = await res.json();
        if (!cancelled && data.success && data.user) {
          setUser(data.user as AppUser);
        }
      } catch {
        // network error — leave user as null
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, router]);

  return user;
}
