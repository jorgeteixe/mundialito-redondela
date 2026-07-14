import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { sql } from "drizzle-orm";

import type { db as Db } from "@mr/db";

const DEFAULT_TIME_ZONE = "Europe/Madrid";
const MATCH_DURATION_MS = 30 * 60 * 1000;

type Database = typeof Db;

export type RescheduleOptions = {
  from: string;
  to: string;
  apply: boolean;
  timeZone: string;
};

type MatchSchedule = {
  id: string;
  code: string | null;
  category: string;
  scheduledAt: Date;
  rescheduledAt: Date;
};

function loadEnvironment() {
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
    quiet: true,
  });
}

export function isDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month! - 1 &&
    date.getUTCDate() === day
  );
}

export function parseArgs(args: string[]): RescheduleOptions {
  const values = new Map<string, string>();
  let apply = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    if (argument === "--apply") {
      apply = true;
      continue;
    }

    if (!["--from", "--to", "--timezone"].includes(argument)) {
      throw new Error(`Unknown argument: ${argument}`);
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${argument}`);
    }
    values.set(argument, value);
    index += 1;
  }

  const from = values.get("--from");
  const to = values.get("--to");
  if (!from || !to) {
    throw new Error("Both --from and --to are required (YYYY-MM-DD).");
  }
  if (!isDateOnly(from) || !isDateOnly(to)) {
    throw new Error("--from and --to must be valid YYYY-MM-DD dates.");
  }
  if (from === to) {
    throw new Error("--from and --to must differ.");
  }

  return {
    from,
    to,
    apply,
    timeZone: values.get("--timezone") ?? DEFAULT_TIME_ZONE,
  };
}

export function findScheduleConflicts(
  movedMatches: MatchSchedule[],
  destinationMatches: Pick<MatchSchedule, "id" | "scheduledAt">[],
) {
  return movedMatches.flatMap((moved) =>
    destinationMatches
      .filter(
        (existing) =>
          existing.id !== moved.id &&
          Math.abs(
            existing.scheduledAt.getTime() - moved.rescheduledAt.getTime(),
          ) < MATCH_DURATION_MS,
      )
      .map((existing) => ({ moved, existing })),
  );
}

export async function rescheduleMatches(
  db: Database,
  options: RescheduleOptions,
) {
  const { schema } = await import("@mr/db");
  const { match } = schema;

  return db.transaction(async (tx) => {
    const movedMatches = await tx
      .select({
        id: match.id,
        code: match.code,
        category: match.category,
        scheduledAt: match.scheduledAt,
        rescheduledAt:
          sql<Date>`(${options.to}::date + (${match.scheduledAt} at time zone ${options.timeZone})::time) at time zone ${options.timeZone}`.mapWith(
            match.scheduledAt,
          ),
      })
      .from(match)
      .where(
        sql`(${match.scheduledAt} at time zone ${options.timeZone})::date = ${options.from}::date`,
      )
      .orderBy(match.scheduledAt)
      .for("update");

    const destinationMatches = await tx
      .select({
        id: match.id,
        scheduledAt: match.scheduledAt,
      })
      .from(match)
      .where(
        sql`(${match.scheduledAt} at time zone ${options.timeZone})::date = ${options.to}::date`,
      )
      .for("update");

    const conflicts = findScheduleConflicts(movedMatches, destinationMatches);
    if (conflicts.length > 0) {
      const details = conflicts
        .map(
          ({ moved, existing }) =>
            `${moved.code ?? moved.id} -> ${moved.rescheduledAt.toISOString()} conflicts with ${existing.id}`,
        )
        .join("\n");
      throw new Error(`Destination schedule has conflicts:\n${details}`);
    }

    if (!options.apply || movedMatches.length === 0) return movedMatches;

    const updated = await tx
      .update(match)
      .set({
        scheduledAt: sql`(${options.to}::date + (${match.scheduledAt} at time zone ${options.timeZone})::time) at time zone ${options.timeZone}`,
      })
      .where(
        sql`(${match.scheduledAt} at time zone ${options.timeZone})::date = ${options.from}::date`,
      )
      .returning({ id: match.id });

    if (updated.length !== movedMatches.length) {
      throw new Error(
        `Selected ${movedMatches.length} matches but updated ${updated.length}. Transaction rolled back.`,
      );
    }

    return movedMatches;
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  loadEnvironment();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set.");
  }

  const { db } = await import("@mr/db");
  const matches = await rescheduleMatches(db, options);

  console.table(
    matches.map((match) => ({
      match: match.code ?? match.id,
      category: match.category,
      from: match.scheduledAt.toISOString(),
      to: match.rescheduledAt.toISOString(),
    })),
  );
  console.log(
    options.apply
      ? `Updated ${matches.length} match(es).`
      : `Preview: ${matches.length} match(es). Re-run with --apply to update.`,
  );
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  main()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
