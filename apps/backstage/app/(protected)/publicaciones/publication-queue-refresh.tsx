"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type PublicationQueueRefreshProps = {
  enabled: boolean;
  intervalMs?: number;
};

export function PublicationQueueRefresh({
  enabled,
  intervalMs = 3000,
}: PublicationQueueRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const interval = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [enabled, intervalMs, router]);

  return null;
}
