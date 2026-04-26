"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserId } from "./userSession";

export function useRequireUser(): string | null {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = getUserId();
    if (!id) {
      router.replace("/");
    } else {
      setUserId(id);
    }
  }, [router]);

  return userId;
}
