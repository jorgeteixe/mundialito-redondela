import { Badge, CategoryBadge, cn } from "@mr/ui";
import { AbsoluteFill } from "remotion";
import { TeamAvatar } from "../../components/TeamAvatar";
import { fontFamily } from "../../fonts";
import type { GroupStandingsProps } from "./schema";

const CATEGORY_LABELS = {
  senior: "Senior",
  cadet: "Cadete",
} as const;

const STAT_COLUMNS = [
  { key: "played", label: "PJ" },
  { key: "wins", label: "G" },
  { key: "draws", label: "E" },
  { key: "losses", label: "P" },
  { key: "goalsFor", label: "GF" },
  { key: "goalsAgainst", label: "GC" },
  { key: "goalDifference", label: "DG" },
] as const;

function TeamCell({ teamId, teamName }: { teamId: string; teamName: string }) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <TeamAvatar
        name={teamName}
        seed={teamId}
        className="size-14 flex-none"
        fallbackClassName="text-lg font-semibold"
      />
      <span className="min-w-0 truncate text-[28px] font-semibold tracking-tight text-foreground">
        {teamName}
      </span>
    </div>
  );
}

export function GroupStandingsImage({
  eyebrow = "Clasificación",
  groupName,
  phase = "Fase 1",
  category = "senior",
  categoryLabel,
  venue = "Pista de A Xunqueira, Redondela",
  qualifyCount = 2,
  rows,
}: GroupStandingsProps) {
  return (
    <AbsoluteFill
      className="bg-background text-foreground"
      style={{ fontFamily }}
    >
      <div className="flex h-full flex-col items-center justify-center gap-9 px-12 py-12">
        <header className="flex flex-col items-center text-center">
          <Badge variant="secondary" className="h-5 px-2 text-[12px]">
            XLVII
          </Badge>
          <p className="mt-3 text-[30px] font-semibold tracking-tight text-foreground">
            Mundialito da Xunqueira
          </p>
          <p className="mt-6 text-[22px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-[940px] text-[76px] font-bold leading-none tracking-tight text-foreground">
            {groupName}
          </h1>
          <div className="mt-5 flex items-center justify-center gap-2">
            <CategoryBadge
              category={category}
              label={categoryLabel ?? CATEGORY_LABELS[category]}
              className="h-7 px-3 text-[16px]"
            />
            <Badge variant="outline" className="h-7 px-3 text-[16px]">
              {phase}
            </Badge>
          </div>
        </header>

        <main className="w-full max-w-[980px] overflow-hidden border bg-card text-card-foreground shadow-sm">
          <div className="grid grid-cols-[64px_minmax(0,1fr)_repeat(7,58px)_76px] items-center border-b px-4 py-3 text-[17px] font-medium tabular-nums text-muted-foreground">
            <div>#</div>
            <div>Equipo</div>
            {STAT_COLUMNS.map((column) => (
              <div key={column.key} className="text-center">
                {column.label}
              </div>
            ))}
            <div className="text-right text-foreground">Pts</div>
          </div>

          {rows.map((row, index) => {
            const qualifies = index < qualifyCount;

            return (
              <div
                key={row.teamId}
                className={cn(
                  "grid grid-cols-[64px_minmax(0,1fr)_repeat(7,58px)_76px] items-center border-b px-4 py-4 text-[24px] tabular-nums last:border-b-0",
                  qualifies && "bg-muted/40",
                )}
              >
                <div
                  className={cn(
                    "font-medium text-muted-foreground",
                    qualifies &&
                      "border-l-4 border-primary pl-3 text-foreground",
                  )}
                >
                  {index + 1}
                </div>
                <TeamCell teamId={row.teamId} teamName={row.teamName} />
                {STAT_COLUMNS.map((column) => (
                  <div
                    key={column.key}
                    className="text-center text-muted-foreground"
                  >
                    {row[column.key]}
                  </div>
                ))}
                <div className="text-right text-[30px] font-bold text-foreground">
                  {row.points}
                </div>
              </div>
            );
          })}
        </main>

        <footer className="flex w-full max-w-[980px] items-center justify-between gap-6 text-[20px] text-muted-foreground">
          <span>{venue}</span>
          {qualifyCount > 0 ? (
            <span className="flex items-center gap-2">
              <span className="h-5 w-1 bg-primary" />
              Clasifican {qualifyCount}
            </span>
          ) : null}
        </footer>
      </div>
    </AbsoluteFill>
  );
}
