import type { ReactNode } from "react";
import { cn } from "@mr/ui";

interface HeroProps {
  badge?: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Hero({
  badge,
  title,
  description,
  actions,
  className,
}: HeroProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-6 px-6 py-16 text-center sm:py-24",
        className,
      )}
    >
      {badge && <div className="flex justify-center">{badge}</div>}
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        {title}
      </h1>
      {description && (
        <div className="flex max-w-md flex-col gap-2 text-sm text-muted-foreground sm:text-base">
          {description}
        </div>
      )}
      {actions && (
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {actions}
        </div>
      )}
    </section>
  );
}
