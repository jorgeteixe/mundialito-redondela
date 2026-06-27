import { listPublicF1GroupStandings, listPublicMatches } from "@mr/db";
import { buildScheduleDays, todayKey } from "./calendar-format";
import { DayCalendar } from "./components/day-calendar";
import { Footer } from "./components/footer";
import { GroupStandingsSection } from "./components/group-standings-section";
import { Header } from "./components/header";
import { ModeToggle } from "./components/mode-toggle";

const LEGAL_LINKS = [
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Política de cookies", href: "/cookies" },
];

export default async function Home() {
  const [matches, groupStandings] = await Promise.all([
    listPublicMatches(),
    listPublicF1GroupStandings(),
  ]);
  const days = buildScheduleDays(matches);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        edition="XLVII"
        eventName="Mundialito da Xunqueira"
        actions={<ModeToggle />}
      />
      <main className="flex flex-1 flex-col">
        <DayCalendar days={days} todayKey={todayKey()} />
        <GroupStandingsSection groups={groupStandings} />
      </main>
      <Footer
        copyright="© 2026 Mundialito Redondela · Sitio no oficial"
        legalLinks={LEGAL_LINKS}
      />
    </div>
  );
}
