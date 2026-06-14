"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface ThemeToggleProps {
  onSetTheme: (theme: "light" | "dark" | "system") => void;
}

export function ThemeToggle({ onSetTheme }: ThemeToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSetTheme("light")}>
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSetTheme("dark")}>
          Oscuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSetTheme("system")}>
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
