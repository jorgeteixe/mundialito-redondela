import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";
import { ModeToggle } from "./mode-toggle";

const LEGAL_LINKS = [
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Política de cookies", href: "/cookies" },
];

type LegalPageProps = {
  title: string;
  children?: ReactNode;
};

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        edition="XLVII"
        eventName="Mundialito da Xunqueira"
        actions={<ModeToggle />}
      />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {children ? (
          <div className="mt-6 flex flex-col gap-4 text-sm leading-6 text-muted-foreground sm:text-base">
            {children}
          </div>
        ) : null}
      </main>
      <Footer
        copyright="© 2026 Mundialito Redondela · Sitio no oficial"
        legalLinks={LEGAL_LINKS}
      />
    </div>
  );
}
