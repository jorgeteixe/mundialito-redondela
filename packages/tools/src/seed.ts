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

// --- Seed configuration ---
const TEAM_COUNT = 25;
const TEAMS_PER_GROUP = 5;
const PLAYERS_PER_TEAM = 8;
const DAYS_FROM_NOW = 2; // first match day = today + this
const FIRST_SLOT_HOUR = 20; // 20:00
const LAST_SLOT_HOUR = 23; // last match of the day starts at 23:00
const SLOT_MINUTES = 30; // a match every 30 minutes

const TEAM_NAMES = [
  "Atlético Redondela",
  "Real Cesantes",
  "Deportivo Chapela",
  "Unión Cabanas",
  "Sporting Reboreda",
  "CD Saxamonde",
  "Racing Quintela",
  "Vila de Trasmañó",
  "Os Eidos FC",
  "Peña Soutoxuste",
  "Estrela do Viso",
  "Mariña Cedeira",
  "Ponte Sampaio",
  "Vigo do Sur",
  "Lonxa Arcade",
  "Furia Negros",
  "Os Lobos da Ría",
  "Costa Vela",
  "Galaicos FC",
  "Os Bravú",
  "Toxos e Frores",
  "Breogán do Mar",
  "Auriverde CF",
  "Pontellas United",
  "Os Carballos",
];

const FIRST_NAMES = [
  "Brais",
  "Iago",
  "Anxo",
  "Xoán",
  "Martiño",
  "Lois",
  "Uxío",
  "Roi",
  "Pedro",
  "Manel",
  "Antón",
  "Suso",
  "Breixo",
  "Xacobe",
  "Mauro",
  "Noel",
];

const LAST_NAMES = [
  "Fernández",
  "Rodríguez",
  "Pérez",
  "Vázquez",
  "Gómez",
  "Otero",
  "Lago",
  "Souto",
  "Cabanas",
  "Soutullo",
  "Domínguez",
  "Iglesias",
];

function groupLabel(index: number): string {
  return String.fromCharCode(65 + index); // A, B, C, ...
}

const SLOTS_PER_DAY =
  Math.floor(((LAST_SLOT_HOUR - FIRST_SLOT_HOUR) * 60) / SLOT_MINUTES) + 1;

/**
 * Round-robin via the circle method: returns rounds, each round a list of
 * pairings where every team plays at most once. Each team meets every other
 * exactly once across all rounds.
 */
function roundRobinRounds<T>(teams: T[]): Array<Array<[T, T]>> {
  const arr: Array<T | null> = [...teams];
  if (arr.length % 2 === 1) arr.push(null); // bye placeholder
  const n = arr.length;
  const rounds: Array<Array<[T, T]>> = [];

  for (let r = 0; r < n - 1; r++) {
    const round: Array<[T, T]> = [];
    for (let i = 0; i < n / 2; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (home != null && away != null) round.push([home, away]);
    }
    rounds.push(round);
    // rotate all but the first element
    const last = arr.pop() as T | null;
    arr.splice(1, 0, last);
  }
  return rounds;
}

/** scheduledAt for a given day index and slot index within that day. */
function slotDate(dayIndex: number, slotIndex: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + DAYS_FROM_NOW + dayIndex);
  date.setHours(FIRST_SLOT_HOUR, slotIndex * SLOT_MINUTES, 0, 0);
  return date;
}

export async function seed(db: typeof DbType) {
  const schema = await import("@mr/db/schema");

  console.log("Seeding tournament data…");

  const groupCount = Math.ceil(TEAM_COUNT / TEAMS_PER_GROUP);

  // Groups
  const groupRows = await db
    .insert(schema.tournamentGroup)
    .values(
      Array.from({ length: groupCount }, (_, i) => ({
        name: `Grupo ${groupLabel(i)}`,
        avatarLabel: groupLabel(i),
        category: "senior" as const,
      })),
    )
    .returning();

  // Teams, assigned round-robin into groups
  const teamRows = await db
    .insert(schema.team)
    .values(
      Array.from({ length: TEAM_COUNT }, (_, i) => ({
        name: TEAM_NAMES[i] ?? `Equipo ${i + 1}`,
        category: "senior" as const,
        groupId: groupRows[i % groupCount]!.id,
      })),
    )
    .returning();

  // Players
  await db.insert(schema.player).values(
    teamRows.flatMap((team, ti) =>
      Array.from({ length: PLAYERS_PER_TEAM }, (_, pi) => ({
        name: `${FIRST_NAMES[(ti + pi) % FIRST_NAMES.length]} ${
          LAST_NAMES[(ti * 3 + pi) % LAST_NAMES.length]
        }`,
        teamId: team.id,
      })),
    ),
  );

  // Build every group match (full round-robin within each group).
  const pending: Array<{
    groupId: string;
    homeTeamId: string;
    awayTeamId: string;
  }> = [];

  for (const group of groupRows) {
    const groupTeams = teamRows.filter((t) => t.groupId === group.id);
    for (const round of roundRobinRounds(groupTeams)) {
      for (const [home, away] of round) {
        pending.push({
          groupId: group.id,
          homeTeamId: home.id,
          awayTeamId: away.id,
        });
      }
    }
  }

  // Greedily pack matches into days: each day holds up to SLOTS_PER_DAY
  // matches and no team plays twice on the same day.
  const matchValues: Array<{
    groupId: string;
    homeTeamId: string;
    awayTeamId: string;
    scheduledAt: Date;
  }> = [];

  let remaining = pending;
  let dayIndex = 0;
  while (remaining.length > 0) {
    const playedToday = new Set<string>();
    const leftover: typeof remaining = [];
    let slot = 0;

    for (const m of remaining) {
      if (
        slot < SLOTS_PER_DAY &&
        !playedToday.has(m.homeTeamId) &&
        !playedToday.has(m.awayTeamId)
      ) {
        matchValues.push({ ...m, scheduledAt: slotDate(dayIndex, slot) });
        playedToday.add(m.homeTeamId);
        playedToday.add(m.awayTeamId);
        slot++;
      } else {
        leftover.push(m);
      }
    }

    remaining = leftover;
    dayIndex++;
  }

  await db.insert(schema.match).values(matchValues);

  console.log(
    `Seeded ${groupRows.length} groups, ${teamRows.length} teams, ` +
      `${teamRows.length * PLAYERS_PER_TEAM} players, ${matchValues.length} matches.`,
  );
}

// Run standalone: `tsx src/seed.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  const { db } = await import("@mr/db");
  await seed(db);
  process.exit(0);
}
