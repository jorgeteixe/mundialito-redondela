import { Frame } from "../../components/Frame";
import { TeamCrest } from "../../components/TeamCrest";
import type { TeamScore } from "../../schemas";
import { colors, space } from "../../theme";
import type { ResultProps } from "./schema";

function TeamColumn({ team, won }: { team: TeamScore; won: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: space(3),
      }}
    >
      <TeamCrest name={team.name} size={200} />
      <div
        style={{
          fontSize: 46,
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.1,
          minWidth: 0,
        }}
      >
        {team.name}
      </div>
      <div
        style={{
          fontSize: 200,
          fontWeight: 800,
          lineHeight: 1,
          color: won ? colors.highlight : colors.foreground,
        }}
      >
        {team.score}
      </div>
    </div>
  );
}

export function Result({ home, away, note }: ResultProps) {
  return (
    <Frame>
      <div
        style={{
          fontSize: 38,
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: colors.highlight,
          textAlign: "center",
          marginBottom: space(6),
        }}
      >
        Resultado final
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: space(3),
        }}
      >
        <TeamColumn team={home} won={home.score > away.score} />
        <div
          style={{
            fontSize: 120,
            fontWeight: 300,
            color: colors.muted,
            paddingTop: space(40),
          }}
        >
          –
        </div>
        <TeamColumn team={away} won={away.score > home.score} />
      </div>
      {note ? (
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: colors.muted,
            textAlign: "center",
            marginTop: space(7),
          }}
        >
          {note}
        </div>
      ) : null}
    </Frame>
  );
}
