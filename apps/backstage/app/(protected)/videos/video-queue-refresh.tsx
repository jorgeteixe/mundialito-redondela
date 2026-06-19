"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type VideoQueueRefreshProps = {
  enabled: boolean;
  intervalMs?: number;
};

export function VideoQueueRefresh({
  enabled,
  intervalMs = 3000,
}: VideoQueueRefreshProps) {
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
