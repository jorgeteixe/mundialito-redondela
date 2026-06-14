import { Button } from "@mr/ui";
import Link from "next/link";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { ModeToggle } from "./components/mode-toggle";

const LEGAL_LINKS = [
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Política de cookies", href: "/cookies" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        edition="XLVII"
        eventName="Mundialito da Xunqueira"
        navItems={<></>}
        actions={<ModeToggle />}
      />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 pt-20 text-center">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
          Error 404
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Página no encontrada
        </h1>
        <p className="text-muted-foreground max-w-sm text-base">
          La página que buscas no existe o ha sido movida.
        </p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </main>
      <Footer
        copyright="© 2026 Mundialito Redondela · Sitio no oficial"
        email="contacto@mundialitoredondela.com"
        legalLinks={LEGAL_LINKS}
      />
    </div>
  );
}
