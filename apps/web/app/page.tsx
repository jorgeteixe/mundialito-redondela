import { listPublicMatches } from "@mr/db";
import { buildScheduleDays, todayKey } from "./calendar-format";
import { DayCalendar } from "./components/day-calendar";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { ModeToggle } from "./components/mode-toggle";

const LEGAL_LINKS = [
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Política de cookies", href: "/cookies" },
];

export default async function Home() {
  const matches = await listPublicMatches();
  const days = buildScheduleDays(matches);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        edition="XLVII"
        eventName="Mundialito da Xunqueira"
        actions={<ModeToggle />}
      />
      <main className="flex flex-1 pt-20">
        <DayCalendar days={days} todayKey={todayKey()} />
      </main>
      <Footer
        copyright="© 2026 Mundialito Redondela · Sitio no oficial"
        email="contacto@mundialitoredondela.com"
        legalLinks={LEGAL_LINKS}
      />
    </div>
  );
}
