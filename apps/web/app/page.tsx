import {
  listPublicGroupStandings,
  listPublicMatches,
  qualifyingTeamIds,
} from "@mr/db";
import { SocialCallout } from "@mr/ui";
import { buildScheduleDays, todayKey } from "./calendar-format";
import { DayCalendar } from "./components/day-calendar";
import { Footer } from "./components/footer";
import { GroupStandingsSection } from "./components/group-standings-section";
import { Header } from "./components/header";
import { ModeToggle } from "./components/mode-toggle";

// "Hoy" / the calendar's selected day derive from `new Date()` at render time,
// so the page must render per-request rather than be baked at build time.
// Otherwise the prerendered HTML and the per-request tree disagree on date-
// derived state (e.g. the disabled prev-day button) and hydration mismatches.
export const dynamic = "force-dynamic";

const LEGAL_LINKS = [
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Política de cookies", href: "/cookies" },
];

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/mundialitoredondela",
  facebook: "https://www.facebook.com/mundialitoredondela",
};

export default async function Home() {
  const [matches, f1Groups, f2Groups] = await Promise.all([
    listPublicMatches(),
    listPublicGroupStandings("f1"),
    listPublicGroupStandings("f2"),
  ]);
  const days = buildScheduleDays(matches);
  const f1Qualifying = [...qualifyingTeamIds(f1Groups)];
  const f2Qualifying = [...qualifyingTeamIds(f2Groups)];

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        edition="XLVII"
        eventName="Mundialito da Xunqueira"
        actions={<ModeToggle />}
      />
      <main className="flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-3xl px-4 pt-3 sm:px-6">
          <SocialCallout
            compact
            title="¡Síguenos en redes!"
            instagram={SOCIAL_LINKS.instagram}
            facebook={SOCIAL_LINKS.facebook}
          />
        </section>
        <DayCalendar days={days} todayKey={todayKey()} />
        <GroupStandingsSection
          groups={f1Groups}
          qualifyingTeamIds={f1Qualifying}
        />
        {f2Groups.length > 0 ? (
          <GroupStandingsSection
            groups={f2Groups}
            qualifyingTeamIds={f2Qualifying}
          />
        ) : null}
      </main>
      <Footer
        copyright="© 2026 Mundialito Redondela · Sitio no oficial"
        legalLinks={LEGAL_LINKS}
      />
    </div>
  );
}
