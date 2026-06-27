"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn, Badge, Button } from "@mr/ui";

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
    <div className={cn("relative z-50 px-4 pt-4", className)}>
      <div className="mx-auto flex max-w-6xl flex-col gap-2">
        <header className="flex items-center bg-card/80 px-3 py-2 ring-1 ring-border backdrop-blur-md">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-2 transition-colors hover:text-primary"
            aria-label="Ir al inicio"
          >
            <span className="text-xs font-medium">{eventName}</span>
            <Badge variant="secondary">{edition}</Badge>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">{navItems}</nav>

          <div className="flex flex-none items-center justify-end gap-1 sm:flex-1">
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
            className="flex flex-col gap-1 bg-card/80 p-2 ring-1 ring-border backdrop-blur-md sm:hidden [&_button]:w-full [&_button]:justify-start"
            onClick={() => setOpen(false)}
          >
            {navItems}
          </div>
        )}
      </div>
    </div>
  );
}
