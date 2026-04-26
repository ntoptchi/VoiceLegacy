"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getUserId } from "./userSession";

function subscribe() {
  return () => {};
}

function getServerSnapshot(): string | null {
  return null;
}

export function useRequireUser(): string | null {
  const router = useRouter();
  const userId = useSyncExternalStore(subscribe, getUserId, getServerSnapshot);

  useEffect(() => {
    if (!userId) {
      router.replace("/");
    }
  }, [router, userId]);

  return userId;
}
