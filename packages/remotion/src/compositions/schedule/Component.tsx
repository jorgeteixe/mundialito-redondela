import { Frame } from "../../components/Frame";
import { Headline } from "../../components/Headline";
import { TeamCrest } from "../../components/TeamCrest";
import { colors, radius, space } from "../../theme";
import type { ScheduleProps } from "./schema";

function TeamSide({ name, align }: { name: string; align: "left" | "right" }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: space(2.5),
        flexDirection: align === "right" ? "row-reverse" : "row",
      }}
    >
      <TeamCrest name={name} size={88} />
      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          minWidth: 0,
          textAlign: align,
          lineHeight: 1.1,
        }}
      >
        {name}
      </div>
    </div>
  );
}

function MatchRow({
  time,
  home,
  away,
  category,
}: ScheduleProps["matches"][number]) {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `2px solid ${colors.surfaceBorder}`,
        borderRadius: radius.lg,
        padding: space(3.5),
        display: "flex",
        flexDirection: "column",
        gap: space(2),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: space(2) }}>
        <span
          style={{
            fontSize: 38,
            fontWeight: 800,
            color: colors.primary,
            backgroundColor: colors.highlight,
            padding: `${space(1)}px ${space(2.5)}px`,
            borderRadius: radius.pill,
          }}
        >
          {time}
        </span>
        {category ? (
          <span
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: colors.muted,
            }}
          >
            {category}
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: space(2) }}>
        <TeamSide name={home} align="left" />
        <span style={{ fontSize: 34, fontWeight: 800, color: colors.accent }}>
          VS
        </span>
        <TeamSide name={away} align="right" />
      </div>
    </div>
  );
}

export function Schedule({ date, matches }: ScheduleProps) {
  return (
    <Frame contentStyle={{ justifyContent: "flex-start" }}>
      <Headline eyebrow="Partidos de hoy" title={date} />
      <div style={{ display: "flex", flexDirection: "column", gap: space(3) }}>
        {matches.map((match, i) => (
          <MatchRow key={i} {...match} />
        ))}
      </div>
    </Frame>
  );
}
