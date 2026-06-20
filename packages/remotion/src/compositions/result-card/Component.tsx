import { Badge, Card, CardContent, CardHeader, CardTitle } from "@mr/ui";
import { AbsoluteFill } from "remotion";
import type { ResultCardProps } from "./schema";

export function ResultCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  category,
}: ResultCardProps) {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0b6e4f",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Render the UI tree at its natural size and scale the whole subtree, so
          radii/borders/padding stay proportional. */}
      <div style={{ transform: "scale(2.2)" }}>
        <Card className="w-80">
          <CardHeader className="items-center text-center">
            <Badge variant="secondary">{category}</Badge>
            <CardTitle>Resultado final</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center text-lg font-semibold">
              {homeTeam}
            </div>
            <div className="text-3xl font-bold tabular-nums">
              {homeScore} - {awayScore}
            </div>
            <div className="flex-1 text-center text-lg font-semibold">
              {awayTeam}
            </div>
          </CardContent>
        </Card>
      </div>
    </AbsoluteFill>
  );
}
