import { interpolate } from "remotion";
import { AnimatedIn, useEntrance } from "../../components/AnimatedIn";
import { Frame } from "../../components/Frame";
import { TeamCrest } from "../../components/TeamCrest";
import type { TeamScore } from "../../schemas";
import { colors, radius, space } from "../../theme";
import type { GoalProps } from "./schema";

function ScoreboardSide({ team }: { team: TeamScore }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: space(2),
      }}
    >
      <TeamCrest name={team.name} size={72} />
      <div style={{ fontSize: 34, fontWeight: 700, minWidth: 0 }}>
        {team.name}
      </div>
      <div style={{ fontSize: 56, fontWeight: 800, marginLeft: "auto" }}>
        {team.score}
      </div>
    </div>
  );
}

export function Goal({ scorer, team, minute, home, away }: GoalProps) {
  const pop = useEntrance(0);
  const scale = interpolate(pop, [0, 1], [0.6, 1]);

  return (
    <Frame>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: space(4),
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 280,
            fontWeight: 800,
            lineHeight: 0.9,
            color: colors.highlight,
            transform: `scale(${scale})`,
          }}
        >
          ¡GOL!
        </div>

        <AnimatedIn delay={6}>
          <div style={{ fontSize: 110, fontWeight: 800, lineHeight: 1 }}>
            {scorer}
          </div>
        </AnimatedIn>

        <AnimatedIn delay={10}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: space(2.5),
              justifyContent: "center",
            }}
          >
            <span
              style={{ fontSize: 44, fontWeight: 600, color: colors.muted }}
            >
              {team}
            </span>
            <span
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: colors.primary,
                backgroundColor: colors.highlight,
                padding: `${space(0.75)}px ${space(2.5)}px`,
                borderRadius: radius.pill,
              }}
            >
              {minute}&apos;
            </span>
          </div>
        </AnimatedIn>
      </div>

      <AnimatedIn delay={14} distance={40}>
        <div
          style={{
            backgroundColor: colors.surface,
            border: `2px solid ${colors.surfaceBorder}`,
            borderRadius: radius.lg,
            padding: space(3.5),
            display: "flex",
            alignItems: "center",
            gap: space(3),
          }}
        >
          <ScoreboardSide team={home} />
          <span style={{ fontSize: 44, fontWeight: 300, color: colors.muted }}>
            –
          </span>
          <ScoreboardSide team={away} />
        </div>
      </AnimatedIn>
    </Frame>
  );
}
