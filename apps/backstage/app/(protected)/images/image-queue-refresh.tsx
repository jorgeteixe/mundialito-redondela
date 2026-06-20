"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ImageQueueRefreshProps = {
  enabled: boolean;
  intervalMs?: number;
};

export function ImageQueueRefresh({
  enabled,
  intervalMs = 3000,
}: ImageQueueRefreshProps) {
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
