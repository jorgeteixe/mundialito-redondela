import type { ReactNode } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { AnimatedIn } from "../../components/AnimatedIn";
import { fontFamily } from "../../fonts";
import { space } from "../../theme";
import { TOURNAMENT } from "../../tournament";
import { social } from "../dummy/brand";
import {
  CalendarIcon,
  EditionBadge,
  MetaItem,
  PinIcon,
  Wordmark,
} from "../dummy/parts";
import { REPO, STACK } from "./content";
import { Card, CardLabel, Pill, TeamDot, fontMono } from "./parts";
import { SHOWCASE_SCENES, type ShowcaseProps } from "./schema";
import { ZeroTouchLoop } from "./ZeroTouchLoop";

/**
 * Launch video (16:9, 56s) for the dev-community audience. Honest maker story:
 * the "before" (paper on the bar wall, WhatsApp relay) → "I wanted to play
 * with video generation and agents" → the zero-touch loop as climax → close.
 * VO script lives in content.ts, one line per beat, for a future TTS pass.
 * Styled like the landing page (dummy/brand.ts): white, ink, navy, hairlines.
 */
export function Showcase({ tagline }: ShowcaseProps) {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: social.background,
        color: social.ink,
        fontFamily,
      }}
    >
      <Scene {...SHOWCASE_SCENES.coldOpen}>
        <ColdOpen tagline={tagline} />
      </Scene>
      <Scene {...SHOWCASE_SCENES.paper}>
        <PaperScene />
      </Scene>
      <Scene {...SHOWCASE_SCENES.relay}>
        <RelayScene />
      </Scene>
      <Scene {...SHOWCASE_SCENES.turnWant}>
        <TurnWant />
      </Scene>
      <Scene {...SHOWCASE_SCENES.turnInsight}>
        <TurnInsight />
      </Scene>
      <Scene {...SHOWCASE_SCENES.loop}>
        <ZeroTouchLoop />
      </Scene>
      <Scene {...SHOWCASE_SCENES.breadth}>
        <BreadthScene />
      </Scene>
      <Scene {...SHOWCASE_SCENES.close}>
        <CloseScene />
      </Scene>
    </AbsoluteFill>
  );
}

/** Sequence + cross-fade at both ends so scenes hand over smoothly. */
function Scene({
  from,
  duration,
  children,
}: {
  from: number;
  duration: number;
  children: ReactNode;
}) {
  return (
    <Sequence from={from} durationInFrames={duration}>
      <SceneFade duration={duration}>{children}</SceneFade>
    </Sequence>
  );
}

function SceneFade({
  duration,
  children,
}: {
  duration: number;
  children: ReactNode;
}) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(
          frame,
          [0, 12, duration - 12, duration],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/* --------------------------- beat 1: cold open -------------------------- */

function ColdOpen({ tagline }: { tagline: string }) {
  // "One street court. 47 editions." → sentences revealed one by one.
  const sentences = tagline
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `${s}.`);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: space(12),
        gap: space(4),
      }}
    >
      <AnimatedIn>
        <EditionBadge fontSize={32} fontFamily={fontFamily}>
          {TOURNAMENT.edition} · {TOURNAMENT.year}
        </EditionBadge>
      </AnimatedIn>
      <div>
        {sentences.map((sentence, i) => (
          <AnimatedIn key={sentence} delay={8 + i * 24} distance={40}>
            <div
              style={{
                fontSize: 120,
                fontWeight: 800,
                letterSpacing: -3,
                lineHeight: 1.08,
                color: social.ink,
              }}
            >
              {sentence}
            </div>
          </AnimatedIn>
        ))}
      </div>
      <AnimatedIn delay={60}>
        <Wordmark fontSize={54} fontFamily={fontFamily} color={social.muted} />
      </AnimatedIn>
      <AnimatedIn delay={72}>
        <div style={{ display: "flex", gap: space(5) }}>
          <MetaItem
            icon={<PinIcon size={30} />}
            fontSize={32}
            fontFamily={fontFamily}
          >
            Redondela, Galicia
          </MetaItem>
          <MetaItem
            icon={<CalendarIcon size={30} />}
            fontSize={32}
            fontFamily={fontFamily}
          >
            Jun 29 – Jul 24
          </MetaItem>
        </div>
      </AnimatedIn>
    </AbsoluteFill>
  );
}

/* ---------------------------- beat 2: the paper -------------------------- */

const PAPER_ROWS = [
  ["Chapela — Cesantes", "2·1"],
  ["Redondela — Cedeira", "3·2"],
  ["Saxamonde — Reboreda", "1·4"],
  ["Vilar — Angoriño", "—"],
];

function PaperScene() {
  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space(10),
        padding: `${space(12)}px ${space(14)}px`,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: space(3),
        }}
      >
        <AnimatedIn>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: -2.5,
              lineHeight: 1.05,
            }}
          >
            No app.
            <br />
            No feed.
          </div>
        </AnimatedIn>
        <AnimatedIn delay={28}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: -1.5,
              lineHeight: 1.15,
              color: social.navy,
              maxWidth: 700,
            }}
          >
            A paper on the bar wall.
          </div>
        </AnimatedIn>
      </div>
      <AnimatedIn delay={20} distance={80} style={{ flexShrink: 0 }}>
        <PaperCard />
      </AnimatedIn>
    </AbsoluteFill>
  );
}

function PaperCard() {
  return (
    <div style={{ position: "relative", rotate: "-3deg" }}>
      <div
        style={{
          width: 560,
          backgroundColor: social.background,
          border: `2px solid ${social.border}`,
          borderRadius: 6,
          boxShadow: "0 30px 70px rgba(9, 11, 12, 0.16)",
          padding: `${space(6)}px ${space(5)}px ${space(5)}px`,
          display: "flex",
          flexDirection: "column",
          gap: space(2.5),
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: social.muted,
            textAlign: "center",
          }}
        >
          Resultados · Grupo A
        </div>
        {PAPER_ROWS.map(([match, score], i) => (
          <div
            key={match}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 34,
              fontWeight: 600,
              color: "#3d4447",
              rotate: `${i % 2 === 0 ? 0.5 : -0.5}deg`,
              borderBottom: `2px dashed ${social.border}`,
              paddingBottom: space(1.5),
            }}
          >
            <span>{match}</span>
            <span>{score}</span>
          </div>
        ))}
      </div>
      {/* Tape holding the paper to the wall. */}
      <div
        style={{
          position: "absolute",
          top: -18,
          left: "50%",
          width: 150,
          height: 40,
          translate: "-50% 0",
          rotate: "4deg",
          backgroundColor: "rgba(9, 11, 12, 0.08)",
          border: "1px solid rgba(9, 11, 12, 0.05)",
        }}
      />
    </div>
  );
}

/* ---------------------------- beat 3: the relay -------------------------- */

const RELAY_HOPS = [20, 45, 70, 95];

function RelayScene() {
  const frame = useCurrentFrame();
  const hop = interpolate(frame, RELAY_HOPS, [0, 1, 2, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bob = Math.abs(Math.sin(hop * Math.PI)) * -34;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: space(9),
        padding: space(12),
      }}
    >
      <div style={{ textAlign: "center" }}>
        <AnimatedIn>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              letterSpacing: -2.5,
              lineHeight: 1.05,
            }}
          >
            …and a WhatsApp relay.
          </div>
        </AnimatedIn>
        <AnimatedIn delay={14}>
          <div
            style={{
              marginTop: space(2),
              fontSize: 42,
              fontWeight: 500,
              color: social.muted,
            }}
          >
            Two people per team, passing scores along.
          </div>
        </AnimatedIn>
      </div>
      <AnimatedIn delay={10}>
        <div style={{ position: "relative", paddingTop: 110 }}>
          <div style={{ display: "flex", alignItems: "center", gap: space(2) }}>
            {["Ana", "Brais", "Carme", "Diego"].map((director, i) => (
              <div
                key={director}
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: space(1),
                    width: 150,
                  }}
                >
                  <TeamDot name={director} size={72} />
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 600,
                      color: social.muted,
                    }}
                  >
                    {director}
                  </span>
                </div>
                {i < 3 ? (
                  <span style={{ fontSize: 34, color: social.muted }}>→</span>
                ) : null}
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              top: 30,
              left: 0,
              width: 150,
              display: "flex",
              justifyContent: "center",
              translate: `${hop * 186}px ${bob}px`,
            }}
          >
            <span
              style={{
                fontSize: 30,
                fontWeight: 600,
                color: social.onDark,
                backgroundColor: social.navy,
                padding: `${space(1)}px ${space(2)}px`,
                borderRadius: 14,
                whiteSpace: "nowrap",
              }}
            >
              Chapela 2-1 🔁
            </span>
          </div>
        </div>
      </AnimatedIn>
    </AbsoluteFill>
  );
}

/* ------------------------ beats 4a/4b: the turn -------------------------- */

function TurnWant() {
  const frame = useCurrentFrame();
  const underline = interpolate(frame, [26, 46], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: space(12),
        gap: space(3),
      }}
    >
      <AnimatedIn>
        <div style={{ fontSize: 56, fontWeight: 500, color: social.muted }}>
          I wanted to play with
        </div>
      </AnimatedIn>
      <AnimatedIn delay={10}>
        <div
          style={{
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1.08,
          }}
        >
          video generation & AI agents.
          <div
            style={{
              width: `${underline}%`,
              height: 10,
              borderRadius: 999,
              backgroundColor: social.navy,
              marginTop: space(1.5),
            }}
          />
        </div>
      </AnimatedIn>
    </AbsoluteFill>
  );
}

function TurnInsight() {
  const frame = useCurrentFrame();
  const fadeFirst = interpolate(frame, [35, 50], [1, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: space(12),
        gap: space(4),
      }}
    >
      <AnimatedIn>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.1,
            opacity: fadeFirst,
          }}
        >
          Nobody here would open an admin panel.
        </div>
      </AnimatedIn>
      <AnimatedIn delay={38}>
        <div
          style={{
            fontSize: 100,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1.08,
            color: social.navy,
          }}
        >
          But everyone sends messages.
        </div>
      </AnimatedIn>
    </AbsoluteFill>
  );
}

/* ----------------------------- beat 6: breadth --------------------------- */

function BreadthScene() {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: space(6),
        padding: `${space(10)}px ${space(12)}px`,
      }}
    >
      <AnimatedIn>
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: -1.5,
            textAlign: "center",
            maxWidth: 1400,
          }}
        >
          Plus: a live site, a full backstage,
          <br />a schedule that posts itself.
        </div>
      </AnimatedIn>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: space(3),
        }}
      >
        <AnimatedIn delay={12} distance={40}>
          <Card width={640} style={{ gap: space(2) }}>
            <CardLabel>Public web · live</CardLabel>
            <div
              style={{ display: "flex", alignItems: "center", gap: space(2) }}
            >
              <TeamDot name="Chapela" />
              <span style={{ fontSize: 36, fontWeight: 700, flex: 1 }}>
                Chapela 2 – 1 Cesantes FC
              </span>
            </div>
            <span style={{ fontSize: 28, color: social.muted }}>
              Standings, calendar and teams — mobile-first.
            </span>
          </Card>
        </AnimatedIn>
        <AnimatedIn delay={20} distance={40}>
          <Card width={640} style={{ gap: space(2) }}>
            <CardLabel>Backstage</CardLabel>
            <div style={{ display: "flex", gap: space(1.5), flexWrap: "wrap" }}>
              {["Teams", "Groups", "Brackets", "Media"].map((chip) => (
                <Pill key={chip} fontSize={28}>
                  {chip}
                </Pill>
              ))}
            </div>
            <span style={{ fontSize: 28, color: social.muted }}>
              The whole tournament, no spreadsheets.
            </span>
          </Card>
        </AnimatedIn>
        <AnimatedIn delay={28} distance={40}>
          <Card width={640} style={{ gap: space(2) }}>
            <CardLabel>Cron · 10:00</CardLabel>
            <span style={{ fontSize: 36, fontWeight: 700 }}>
              Today&apos;s fixtures → Instagram
            </span>
            <span style={{ fontSize: 28, color: social.muted }}>
              Every morning, only if there are matches.
            </span>
          </Card>
        </AnimatedIn>
        <AnimatedIn delay={36} distance={40}>
          <Card width={640} style={{ gap: space(2) }}>
            <CardLabel>Cron · 21:30</CardLabel>
            <span style={{ fontSize: 36, fontWeight: 700 }}>
              &ldquo;Missing results?&rdquo; nudge → Telegram
            </span>
            <span style={{ fontSize: 28, color: social.muted }}>
              Only when scores are still missing.
            </span>
          </Card>
        </AnimatedIn>
      </div>
    </AbsoluteFill>
  );
}

/* ------------------------------ beat 7: close ---------------------------- */

function CloseScene() {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: space(12),
        gap: space(4),
      }}
    >
      <AnimatedIn>
        <EditionBadge fontSize={30} fontFamily={fontFamily}>
          {TOURNAMENT.edition} · {TOURNAMENT.year}
        </EditionBadge>
      </AnimatedIn>
      <div>
        <AnimatedIn delay={6}>
          <div style={{ fontSize: 68, fontWeight: 600, color: social.muted }}>
            I got to learn new tools.
          </div>
        </AnimatedIn>
        <AnimatedIn delay={18}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: -2.5,
              lineHeight: 1.1,
            }}
          >
            The tournament got live scores.
          </div>
        </AnimatedIn>
      </div>
      <AnimatedIn delay={30}>
        <div
          style={{
            display: "flex",
            gap: space(2),
            justifyContent: "center",
            flexWrap: "wrap",
            maxWidth: 1300,
          }}
        >
          {STACK.map((tech) => (
            <Pill key={tech} fontSize={30}>
              {tech}
            </Pill>
          ))}
        </div>
      </AnimatedIn>
      <AnimatedIn delay={38}>
        <div style={{ fontSize: 30, fontWeight: 500, color: social.muted }}>
          6 apps · 7 packages · Turborepo
        </div>
      </AnimatedIn>
      <AnimatedIn delay={46}>
        <span
          style={{
            fontFamily: fontMono,
            fontSize: 32,
            fontWeight: 600,
            color: social.onDark,
            backgroundColor: social.ink,
            padding: `${space(1.5)}px ${space(3)}px`,
            borderRadius: 12,
          }}
        >
          {REPO}
        </span>
      </AnimatedIn>
    </AbsoluteFill>
  );
}
