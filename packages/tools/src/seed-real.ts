import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const rootEnvLocalPath = fileURLToPath(
  new URL("../../../.env.local", import.meta.url),
);
const rootEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));
const packageEnvLocalPath = fileURLToPath(
  new URL("../.env.local", import.meta.url),
);
const packageEnvPath = fileURLToPath(new URL("../.env", import.meta.url));

loadEnv({
  path: [packageEnvLocalPath, packageEnvPath, rootEnvLocalPath, rootEnvPath],
});

import type { db as DbType } from "@mr/db";
import { bracketForCategory, slotLabel } from "@mr/db/bracket";

type Category = "senior" | "cadet";

// --- Real tournament data (from the official brackets) ---
type RealGroup = { label: string; teams: string[] };

const REAL_GROUPS: Record<Category, RealGroup[]> = {
  cadet: [
    {
      label: "A",
      teams: ["El Barrio F.S", "Chata F.S", "Al-Coholcon", "Real Coca"],
    },
    {
      label: "B",
      teams: [
        "Sportium Lisboa",
        "C.P Rec Ochoa",
        "Payas Ferreiro",
        "Racing Candeán",
      ],
    },
    {
      label: "C",
      teams: ["Los Galácticos", "Atl. de Villar", "Los Miura", "Susuela"],
    },
  ],
  senior: [
    {
      label: "A",
      teams: ["After Football", "D. Jesús Cao", "C. A Lareira", "Rest. Lemos"],
    },
    {
      label: "B",
      teams: ["Rodavigo", "D'Lirio", "Pub Aquelarre", "M. Miñán Asesores"],
    },
    {
      label: "C",
      teams: ["Aut. Cesantes 2", "Phytema", "A. Rotulaciones", "Sanma F.S"],
    },
    { label: "D", teams: ["T. Redomuro", "VIT", "Impernoroeste", "O Funil"] },
  ],
};

// --- Real fixture calendar (Fase 1) ---
// date = local date, time = local time. Home team first.
type Fixture = { date: string; time: string; home: string; away: string };

const FIXTURES: Fixture[] = [
  // LUNES 29 JUNIO
  {
    date: "2026-06-29",
    time: "20:00",
    home: "El Barrio F.S.",
    away: "Chata F.S.",
  },
  {
    date: "2026-06-29",
    time: "20:30",
    home: "Sportium Lisboa",
    away: "C.P. Rec Ochoa",
  },
  {
    date: "2026-06-29",
    time: "21:00",
    home: "Los Galácticos",
    away: "Atl. de Villar",
  },
  {
    date: "2026-06-29",
    time: "21:30",
    home: "After Football",
    away: "D. Jesús Cao",
  },
  { date: "2026-06-29", time: "22:00", home: "Rodavigo", away: "D'Lirio" },
  // MARTES 30 JUNIO
  { date: "2026-06-30", time: "20:00", home: "Al-Coholcon", away: "Real Coca" },
  {
    date: "2026-06-30",
    time: "20:30",
    home: "Payas Ferreiro",
    away: "Racing Candeán",
  },
  { date: "2026-06-30", time: "21:00", home: "Los Miura", away: "Susuela" },
  {
    date: "2026-06-30",
    time: "21:30",
    home: "T. Redomuro",
    away: "VIT DOMINÓ",
  },
  {
    date: "2026-06-30",
    time: "22:00",
    home: "C. A Lareira",
    away: "Rest. Lemos",
  },
  // MIÉRCOLES 1 JULIO
  {
    date: "2026-07-01",
    time: "20:00",
    home: "Aut. Cesantes 2",
    away: "Phytema",
  },
  {
    date: "2026-07-01",
    time: "20:30",
    home: "Pub Aquelarre",
    away: "M. Miñán Asesores",
  },
  {
    date: "2026-07-01",
    time: "21:00",
    home: "After Football",
    away: "C. A Lareira",
  },
  {
    date: "2026-07-01",
    time: "21:30",
    home: "T. Redomuro",
    away: "Impernoroeste",
  },
  {
    date: "2026-07-01",
    time: "22:00",
    home: "D. Jesús Cao",
    away: "Rest. Lemos",
  },
  { date: "2026-07-01", time: "22:30", home: "VIT DOMINÓ", away: "O Funil" },
  // JUEVES 2 JULIO
  {
    date: "2026-07-02",
    time: "20:00",
    home: "El Barrio F.S.",
    away: "Al-Coholcon",
  },
  {
    date: "2026-07-02",
    time: "20:30",
    home: "Sportium Lisboa",
    away: "Payas Ferreiro",
  },
  {
    date: "2026-07-02",
    time: "21:00",
    home: "Los Galácticos",
    away: "Los Miura",
  },
  {
    date: "2026-07-02",
    time: "21:30",
    home: "A. Rotulaciones",
    away: "Sanma F.S.",
  },
  { date: "2026-07-02", time: "22:00", home: "Impernoroeste", away: "O Funil" },
  // VIERNES 3 JULIO
  { date: "2026-07-03", time: "20:00", home: "Chata F.S.", away: "Real Coca" },
  {
    date: "2026-07-03",
    time: "20:30",
    home: "C.P. Rec Ochoa",
    away: "Racing Candeán",
  },
  {
    date: "2026-07-03",
    time: "21:00",
    home: "Atl. de Villar",
    away: "Susuela",
  },
  {
    date: "2026-07-03",
    time: "21:30",
    home: "Rodavigo",
    away: "Pub Aquelarre",
  },
  {
    date: "2026-07-03",
    time: "22:00",
    home: "Aut. Cesantes 2",
    away: "A. Rotulaciones",
  },
  // LUNES 6 JULIO
  {
    date: "2026-07-06",
    time: "20:00",
    home: "El Barrio F.S.",
    away: "Real Coca",
  },
  {
    date: "2026-07-06",
    time: "20:30",
    home: "Sportium Lisboa",
    away: "Racing Candeán",
  },
  {
    date: "2026-07-06",
    time: "21:00",
    home: "Los Galácticos",
    away: "Susuela",
  },
  { date: "2026-07-06", time: "21:30", home: "Phytema", away: "Sanma F.S." },
  {
    date: "2026-07-06",
    time: "22:00",
    home: "D'Lirio",
    away: "M. Miñán Asesores",
  },
  // MARTES 7 JULIO
  {
    date: "2026-07-07",
    time: "20:00",
    home: "Chata F.S.",
    away: "Al-Coholcon",
  },
  {
    date: "2026-07-07",
    time: "20:30",
    home: "C.P. Rec Ochoa",
    away: "Payas Ferreiro",
  },
  {
    date: "2026-07-07",
    time: "21:00",
    home: "Atl. de Villar",
    away: "Los Miura",
  },
  {
    date: "2026-07-07",
    time: "21:30",
    home: "Rodavigo",
    away: "M. Miñán Asesores",
  },
  {
    date: "2026-07-07",
    time: "22:00",
    home: "After Football",
    away: "Rest. Lemos",
  },
  // MIÉRCOLES 8 JULIO — DESCANSO (no matches)
  // JUEVES 9 JULIO — Cierre de Fase 1 Senior
  {
    date: "2026-07-09",
    time: "20:00",
    home: "D. Jesús Cao",
    away: "C. A Lareira",
  },
  { date: "2026-07-09", time: "20:30", home: "D'Lirio", away: "Pub Aquelarre" },
  {
    date: "2026-07-09",
    time: "21:00",
    home: "Aut. Cesantes 2",
    away: "Sanma F.S.",
  },
  {
    date: "2026-07-09",
    time: "21:30",
    home: "Phytema",
    away: "A. Rotulaciones",
  },
  { date: "2026-07-09", time: "22:00", home: "T. Redomuro", away: "O Funil" },
  {
    date: "2026-07-09",
    time: "22:30",
    home: "VIT DOMINÓ",
    away: "Impernoroeste",
  },
];

const CATEGORIES: Category[] = ["senior", "cadet"];

/** Normalize a team name for matching across calendar/bracket spelling drift. */
function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[.’']/g, "") // strip dots and apostrophes (' and ’)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Calendar names that don't normalize to a seeded team name.
const NAME_ALIASES: Record<string, string> = {
  "vit domino": "vit", // "VIT DOMINÓ" in the calendar → seeded as "VIT"
};

function parseScheduledAt(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year!, month! - 1, day!, hour!, minute!, 0, 0);
}

async function seedTeams(
  db: typeof DbType,
  schema: typeof import("@mr/db/schema"),
  category: Category,
) {
  const groups = REAL_GROUPS[category];

  const groupRows = await db
    .insert(schema.tournamentGroup)
    .values(
      groups.map((g) => ({
        name: `Grupo ${g.label}`,
        avatarLabel: g.label,
        category,
        stage: "f1" as const,
      })),
    )
    .returning();

  const f2Labels =
    category === "senior" ? ["A", "B", "C", "D"] : ["A", "B", "C"];
  const f2GroupRows = await db
    .insert(schema.tournamentGroup)
    .values(
      f2Labels.map((label) => ({
        name: `Grupo ${label} F2`,
        avatarLabel: label,
        category,
        stage: "f2" as const,
      })),
    )
    .returning();

  const teamRows = await db
    .insert(schema.team)
    .values(
      groups.flatMap((g) =>
        g.teams.map((name) => ({
          name,
          category,
        })),
      ),
    )
    .returning();

  await db.insert(schema.tournamentGroupTeam).values(
    groups.flatMap((g, gi) =>
      g.teams.map((name) => {
        const teamRow = teamRows.find((team) => team.name === name);
        if (!teamRow) throw new Error(`Missing seeded team: ${name}`);
        return {
          groupId: groupRows[gi]!.id,
          teamId: teamRow.id,
          stage: "f1" as const,
        };
      }),
    ),
  );

  console.log(
    `  ${category}: ${groupRows.length} F1 groups, ${f2GroupRows.length} F2 groups, ${teamRows.length} teams.`,
  );

  return { teamRows, groupRows, f2GroupRows };
}

export async function seedReal(db: typeof DbType) {
  const schema = await import("@mr/db/schema");

  console.log("Seeding real tournament data…");

  // Insert groups + teams, build a name → team lookup.
  const teamByName = new Map<
    string,
    { id: string; groupId: string; category: Category }
  >();
  const f2GroupByCategoryAndLabel = new Map<string, string>();
  for (const category of CATEGORIES) {
    const { teamRows, groupRows, f2GroupRows } = await seedTeams(
      db,
      schema,
      category,
    );
    const groupByTeamName = new Map<string, string>();
    REAL_GROUPS[category].forEach((group, groupIndex) => {
      for (const name of group.teams) {
        groupByTeamName.set(name, groupRows[groupIndex]!.id);
      }
    });
    for (const t of teamRows) {
      const groupId = groupByTeamName.get(t.name);
      if (!groupId) throw new Error(`Missing group for team: "${t.name}"`);
      teamByName.set(normalizeName(t.name), {
        id: t.id,
        groupId,
        category,
      });
    }
    for (const group of f2GroupRows) {
      f2GroupByCategoryAndLabel.set(
        `${category}:${group.avatarLabel}`,
        group.id,
      );
    }
  }

  const resolve = (name: string) => {
    const key = normalizeName(name);
    return teamByName.get(NAME_ALIASES[key] ?? key);
  };

  // Map fixtures to match rows.
  const matchValues = FIXTURES.map((f) => {
    const home = resolve(f.home);
    const away = resolve(f.away);
    if (!home) throw new Error(`Unknown team in fixture: "${f.home}"`);
    if (!away) throw new Error(`Unknown team in fixture: "${f.away}"`);
    if (!home.groupId || home.groupId !== away.groupId) {
      throw new Error(
        `Fixture crosses groups: "${f.home}" vs "${f.away}" (${f.date} ${f.time})`,
      );
    }
    return {
      category: home.category,
      groupId: home.groupId,
      homeTeamId: home.id,
      awayTeamId: away.id,
      scheduledAt: parseScheduledAt(f.date, f.time),
    };
  });

  await db.insert(schema.match).values(matchValues);

  // F2 group + knockout matches come from the hardcoded bracket. Teams are left
  // empty (placeholder labels only) — the bracket resolver fills them in as
  // results land.
  const bracketValues = CATEGORIES.flatMap((category) =>
    bracketForCategory(category).map((bracketMatch) => {
      const groupId =
        bracketMatch.kind === "group" && bracketMatch.groupLabel
          ? f2GroupByCategoryAndLabel.get(
              `${category}:${bracketMatch.groupLabel}`,
            )
          : null;

      if (bracketMatch.kind === "group" && !groupId) {
        throw new Error(
          `Missing F2 group ${category} ${bracketMatch.groupLabel}`,
        );
      }

      return {
        code: bracketMatch.code,
        category,
        groupId,
        kind: bracketMatch.kind,
        homePlaceholder: slotLabel(bracketMatch.home, category),
        awayPlaceholder: slotLabel(bracketMatch.away, category),
        scheduledAt: parseScheduledAt(bracketMatch.date, bracketMatch.time),
      };
    }),
  );

  await db.insert(schema.match).values(bracketValues);

  console.log(
    `  matches: ${matchValues.length} F1 fixtures, ${bracketValues.length} F2/eliminatoria fixtures scheduled.`,
  );
}

// Run standalone: `tsx src/seed-real.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  const { db } = await import("@mr/db");
  await seedReal(db);
  process.exit(0);
}
