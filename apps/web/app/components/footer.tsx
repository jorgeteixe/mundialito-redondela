import { cn, Separator } from "@mr/ui";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  copyright: string;
  email?: string;
  legalLinks?: FooterLink[];
  className?: string;
}

export function Footer({
  copyright,
  email,
  legalLinks,
  className,
}: FooterProps) {
  return (
    <footer className={cn("w-full", className)}>
      <Separator />
      <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col items-center gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>{copyright}</span>
        {legalLinks && legalLinks.length > 0 && (
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {legalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="transition-colors hover:text-foreground sm:text-right"
          >
            {email}
          </a>
        )}
      </div>
    </footer>
  );
}
