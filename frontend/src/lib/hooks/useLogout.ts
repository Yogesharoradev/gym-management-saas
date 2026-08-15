"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  return useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        router.push("/login");
        router.refresh();
      } else {
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
  }, [router]);
}
