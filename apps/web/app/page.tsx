import { Badge, Button, Countdown, Footer, Header, Hero } from "@mr/ui";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { ModeToggle } from "./components/mode-toggle";

const LEGAL_LINKS = [
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Política de cookies", href: "/cookies" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        edition="XLVII"
        eventName="Mundialito da Xunqueira"
        actions={<ModeToggle />}
      />
      <main className="flex flex-1 items-center justify-center pt-20">
        <Hero
          badge={
            <div className="flex items-center gap-2">
              <Badge variant="secondary">XLVII</Badge>
              <Countdown />
            </div>
          }
          title="Mundialito da Xunqueira"
          description={
            <>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="size-4 shrink-0" />
                <a
                  href="https://maps.app.goo.gl/oAu6FkNf1eUSWW2n6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Pista de A Xunqueira, Redondela
                </a>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CalendarDays className="size-4 shrink-0" />
                <span>29 jun – 24 jul 2026</span>
              </div>
            </>
          }
          actions={
            <>
              <Button asChild>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfw9x_7AGtd7LbWosYPkU06ks8I0kLr-RGnDZETmbMTKuypVg/viewform?usp=sf_link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Inscríbete
                  <ExternalLink className="ml-1 size-3.5" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href="https://redondela.gal/evento/mundialito-da-xunquiera-2026/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Más información
                  <ExternalLink className="ml-1 size-3.5" />
                </a>
              </Button>
            </>
          }
        />
      </main>
      <Footer
        copyright="© 2026 Mundialito Redondela · Sitio no oficial"
        email="contacto@mundialitoredondela.com"
        legalLinks={LEGAL_LINKS}
      />
    </div>
  );
}
