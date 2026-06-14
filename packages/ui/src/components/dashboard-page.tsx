"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { Input } from "../ui/input";
import { EmptyState } from "./empty-state";

interface DashboardPageProps {
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  noResultsState?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardPage({
  searchPlaceholder = "Buscar...",
  onSearchChange,
  actions,
  isEmpty,
  emptyState,
  noResultsState,
  children,
  className,
}: DashboardPageProps) {
  const [search, setSearch] = useState("");

  function handleSearch(value: string) {
    setSearch(value);
    onSearchChange?.(value);
  }

  const defaultNoResults = (
    <EmptyState
      icon={<Search className="h-10 w-10" />}
      title="Sin resultados"
      description={`No se encontraron resultados para "${search}".`}
    />
  );

  const content =
    isEmpty && search
      ? (noResultsState ?? defaultNoResults)
      : isEmpty
        ? emptyState
        : children;

  return (
    <main className={cn("flex flex-col gap-4 p-4 sm:p-6", className)}>
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {actions && (
          <div className="ml-auto flex items-center gap-2">{actions}</div>
        )}
      </div>
      <div>{content}</div>
    </main>
  );
}
