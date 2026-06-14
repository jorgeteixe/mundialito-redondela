"use client";

import { useTheme } from "next-themes";
import { ThemeToggle } from "@mr/ui";

export function ModeToggle() {
  const { setTheme } = useTheme();
  return <ThemeToggle onSetTheme={setTheme} />;
}
