"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface HeaderProps {
  edition: string;
  eventName: string;
  navItems?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function Header({
  edition,
  eventName,
  navItems,
  actions,
  className,
}: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "fixed top-4 left-4 right-4 z-50 flex flex-col gap-2",
        className,
      )}
    >
      <header className="flex items-center bg-card/80 backdrop-blur-md ring-1 ring-border px-3 py-2">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="text-xs font-medium">{eventName}</span>
          <Badge variant="secondary">{edition}</Badge>
        </div>

        <nav className="hidden sm:flex items-center gap-1">{navItems}</nav>

        <div className="flex flex-none sm:flex-1 items-center justify-end gap-1">
          {actions}
          {navItems && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="sm:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
            >
              {open ? <X /> : <Menu />}
            </Button>
          )}
        </div>
      </header>

      {open && navItems && (
        <div
          className="flex flex-col gap-1 p-2 sm:hidden bg-card/80 backdrop-blur-md ring-1 ring-border [&_button]:w-full [&_button]:justify-start"
          onClick={() => setOpen(false)}
        >
          {navItems}
        </div>
      )}
    </div>
  );
}
