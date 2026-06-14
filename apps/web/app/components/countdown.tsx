"use client";

import { useEffect, useState } from "react";
import { Badge } from "@mr/ui";

// June 29 2026 20:00 Madrid time (CEST = UTC+2)
const TARGET = new Date("2026-06-29T20:00:00+02:00");

function getTimeLeft() {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, minutes, seconds };
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1_000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) {
    return <Badge variant="secondary">¡En marcha!</Badge>;
  }

  const { days, hours, minutes, seconds } = timeLeft;
  const label =
    days > 0
      ? `${days}d ${hours}h ${minutes}m`
      : `${hours}h ${minutes}m ${seconds}s`;

  return (
    <Badge variant="outline" className="gap-1.5">
      <span className="size-2 rounded-full bg-current animate-pulse" />
      {label}
    </Badge>
  );
}
