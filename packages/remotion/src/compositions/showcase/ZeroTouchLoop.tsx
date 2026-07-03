import type { ReactNode } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { AnimatedIn } from "../../components/AnimatedIn";
import { brandGradient, space } from "../../theme";
import { social } from "../dummy/brand";
import { Card, CardLabel, Pill, TeamDot, TypingDots, fontMono } from "./parts";
import { LOOP_BEATS } from "./schema";

/**
 * The climax: one continuous 26s scene walking the zero-touch loop
 * (message → agent → confirm → update → publish) over a persistent
 * progress rail, ending on the full-frame punchline.
 */
export function ZeroTouchLoop() {
  return (
    <AbsoluteFill
      style={{
        padding: `${space(7)}px ${space(12)}px ${space(6)}px`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AnimatedIn>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: social.navy,
          }}
        >
          The zero-touch loop
        </div>
      </AnimatedIn>

      <div style={{ flex: 1, position: "relative" }}>
        <Beat {...LOOP_BEATS.chat}>
          <ChatBeat />
        </Beat>
        <Beat {...LOOP_BEATS.confirm}>
          <ConfirmBeat />
        </Beat>
        <Beat {...LOOP_BEATS.core}>
          <CoreBeat />
        </Beat>
        <Beat {...LOOP_BEATS.render}>
          <RenderBeat />
        </Beat>
        <Beat {...LOOP_BEATS.publish}>
          <PublishBeat />
        </Beat>
      </div>

      <ProgressRail />

      {/* Punchline covers everything (rail included) for the final hold. */}
      <Sequence
        from={LOOP_BEATS.publish.from + 95}
        durationInFrames={LOOP_BEATS.publish.duration - 95}
      >
        <Punchline />
      </Sequence>
    </AbsoluteFill>
  );
}

function Beat({
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
      <BeatFade duration={duration}>{children}</BeatFade>
    </Sequence>
  );
}

function BeatFade({
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
          [0, 10, duration - 10, duration],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
        justifyContent: "center",
        alignItems: "center",
        gap: space(5),
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

function BeatHeading({
  children,
  caption,
}: {
  children: ReactNode;
  caption?: ReactNode;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: 60,
          fontWeight: 800,
          letterSpacing: -1.5,
          lineHeight: 1.1,
          color: social.ink,
        }}
      >
        {children}
      </div>
      {caption ? (
        <div
          style={{
            marginTop: space(1.5),
            fontSize: 30,
            fontWeight: 500,
            color: social.muted,
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------- rail ---------------------------------- */

/**
 * Node i lights when its story moment starts. Moments are offset from the
 * literal beat starts: "Agent" lights mid-chat, "Confirm" at the confirm
 * beat, etc., so the rail narrates rather than mirrors the sequence keys.
 */
const RAIL_STEPS = [
  { label: "Message", moment: LOOP_BEATS.chat.from + 20 },
  { label: "Agent", moment: LOOP_BEATS.chat.from + 100 },
  { label: "Confirm", moment: LOOP_BEATS.confirm.from + 60 },
  { label: "Update", moment: LOOP_BEATS.core.from + 40 },
  { label: "Publish", moment: LOOP_BEATS.publish.from + 40 },
] as const;

function ProgressRail() {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: space(1.5),
      }}
    >
      {RAIL_STEPS.map((step, i) => {
        const next = RAIL_STEPS[i + 1];
        const lit = frame >= step.moment;
        const pop = interpolate(
          frame,
          [step.moment, step.moment + 12],
          [0.6, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return (
          <div
            key={step.label}
            style={{ display: "flex", alignItems: "flex-start" }}
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
              <span
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 800,
                  backgroundColor: lit ? social.navy : social.background,
                  border: lit ? "none" : `2px solid ${social.border}`,
                  color: lit ? social.onDark : social.muted,
                  transform: `scale(${lit ? pop : 1})`,
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: lit ? social.ink : social.muted,
                }}
              >
                {step.label}
              </span>
            </div>
            {next ? (
              <span
                style={{
                  width: 70,
                  height: 2,
                  marginTop: 27,
                  backgroundColor:
                    frame >= next.moment ? social.navy : social.border,
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------- beat 5a: chat ----------------------------- */

const HUMAN_MESSAGE = "Chapela 2 - 1 Cesantes";

function ChatBeat() {
  const frame = useCurrentFrame();
  const typed = HUMAN_MESSAGE.slice(
    0,
    Math.round(
      interpolate(frame, [40, 75], [0, HUMAN_MESSAGE.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  const headingSwap = frame >= 95;

  return (
    <>
      <BeatHeading
        caption={headingSwap ? "Mastra + Gemini 2.5 Flash" : undefined}
      >
        {headingSwap ? "An agent reads it." : "Someone types the score."}
      </BeatHeading>
      <Card width={760} style={{ minHeight: 320 }}>
        <CardLabel>Grupo de resultados · Telegram</CardLabel>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: space(2),
            flex: 1,
          }}
        >
          {frame >= 10 && frame < 40 ? (
            <ChatBubble side="right">
              <TypingDots color={social.onDark} />
            </ChatBubble>
          ) : null}
          {frame >= 40 ? <ChatBubble side="right">{typed}</ChatBubble> : null}
          {frame >= 85 && frame < 115 ? (
            <ChatBubble side="left">
              <TypingDots />
            </ChatBubble>
          ) : null}
          {frame >= 115 ? (
            <ChatBubble side="left">
              Partido encontrado: Chapela 2 – 1 Cesantes FC · Senior · Grupo A
            </ChatBubble>
          ) : null}
        </div>
      </Card>
    </>
  );
}

export function ChatBubble({
  children,
  side,
}: {
  children: ReactNode;
  side: "left" | "right";
}) {
  const reply = side === "right";
  return (
    <div
      style={{
        alignSelf: reply ? "flex-end" : "flex-start",
        maxWidth: 560,
        minHeight: 62,
        display: "flex",
        alignItems: "center",
        fontSize: 32,
        fontWeight: 500,
        lineHeight: 1.35,
        padding: `${space(1.5)}px ${space(3)}px`,
        borderRadius: 16,
        backgroundColor: reply ? social.navy : social.background,
        border: reply ? "none" : `2px solid ${social.border}`,
        color: reply ? social.onDark : social.ink,
      }}
    >
      {children}
    </div>
  );
}

/* --------------------------- beat 5b: confirm --------------------------- */

function ConfirmBeat() {
  const frame = useCurrentFrame();
  const pressed = frame >= 60;
  const dip = interpolate(frame, [58, 65, 72], [1, 0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ring = interpolate(frame, [48, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <BeatHeading>
        One tap to confirm —<br />
        it goes live everywhere.
      </BeatHeading>
      <Card width={760}>
        <CardLabel>Confirmar resultado</CardLabel>
        <div style={{ display: "flex", alignItems: "center", gap: space(2) }}>
          <TeamDot name="Chapela" />
          <span style={{ fontSize: 40, fontWeight: 700, whiteSpace: "nowrap" }}>
            Chapela 2 – 1 Cesantes FC
          </span>
          <TeamDot name="Cesantes FC" />
        </div>
        <div style={{ fontSize: 30, fontWeight: 500, color: social.muted }}>
          Senior · Grupo A · Pista de A Xunqueira
        </div>
        <div
          style={{
            display: "flex",
            gap: space(2),
            alignItems: "center",
            marginTop: space(1),
          }}
        >
          <span style={{ position: "relative", display: "inline-flex" }}>
            <span
              style={{ transform: `scale(${dip})`, display: "inline-flex" }}
            >
              <Pill filled fontSize={34}>
                Aprobar
              </Pill>
            </span>
            {ring > 0 && ring < 1 ? (
              <span
                style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: 999,
                  border: `4px solid ${social.navy}`,
                  opacity: 1 - ring,
                  transform: `scale(${0.9 + ring * 0.5})`,
                }}
              />
            ) : null}
          </span>
          <span style={{ opacity: pressed ? 0.35 : 1, display: "inline-flex" }}>
            <Pill fontSize={34}>Denegar</Pill>
          </span>
          {frame >= 80 ? (
            <AnimatedIn distance={20}>
              <span
                style={{ fontSize: 34, fontWeight: 600, color: social.ink }}
              >
                ✅ Resultado guardado
              </span>
            </AnimatedIn>
          ) : null}
        </div>
      </Card>
    </>
  );
}

/* ----------------------------- beat 5c: core ---------------------------- */

const CORE_ROWS = [
  { name: "Cesantes Atlético", before: 6, after: 6, swap: true },
  { name: "Chapela FC", before: 5, after: 8, swap: true },
  { name: "Reboreda", before: 4, after: 4 },
  { name: "Angoriño CF", before: 1, after: 1 },
];

function CoreBeat() {
  const frame = useCurrentFrame();
  const rowHeight = 66;
  // Chapela and Cesantes swap places as the new points land.
  const swap = interpolate(frame, [45, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const points = (row: (typeof CORE_ROWS)[number]) =>
    Math.round(
      interpolate(frame, [40, 60], [row.before, row.after], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );
  const slotResolved = frame >= 95;

  return (
    <>
      <BeatHeading caption="Score. Standings. Brackets. One function.">
        <span
          style={{
            fontFamily: fontMono,
            fontSize: 54,
            backgroundColor: social.border,
            padding: `${space(1)}px ${space(2.5)}px`,
            borderRadius: 12,
          }}
        >
          applyMatchResult()
        </span>
      </BeatHeading>
      <Card width={720}>
        <CardLabel>Clasificación · Grupo A</CardLabel>
        <div style={{ position: "relative", height: rowHeight * 4 }}>
          {CORE_ROWS.map((row, index) => {
            const position = row.swap
              ? index === 0
                ? index + swap
                : index - swap
              : index;
            return (
              <div
                key={row.name}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: position * rowHeight,
                  height: rowHeight,
                  display: "flex",
                  alignItems: "center",
                  gap: space(2.5),
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: position < 1.5 ? social.navy : social.muted,
                    width: 40,
                  }}
                >
                  {Math.round(position) + 1}
                </span>
                <TeamDot name={row.name} />
                <span style={{ fontSize: 38, fontWeight: 600, flex: 1 }}>
                  {row.name}
                </span>
                <span style={{ fontSize: 38, fontWeight: 800 }}>
                  {points(row)}
                </span>
              </div>
            );
          })}
        </div>
        <div
          style={{
            borderTop: `2px solid ${social.border}`,
            paddingTop: space(2.5),
            display: "flex",
            alignItems: "center",
            gap: space(2),
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 500, color: social.muted }}>
            Semifinal 1
          </span>
          <Pill filled={slotResolved} fontSize={28}>
            {slotResolved ? "Chapela FC" : "1º Grupo A"}
          </Pill>
          <span style={{ fontSize: 30, fontWeight: 500, color: social.muted }}>
            vs 2º Grupo B
          </span>
        </div>
      </Card>
    </>
  );
}

/* ---------------------------- beat 5d: render --------------------------- */

function RenderBeat() {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [10, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const counter = String(Math.max(1, Math.round(progress * 150))).padStart(
    3,
    "0",
  );

  return (
    <>
      <BeatHeading caption="Remotion · headless">
        A result video renders itself.
      </BeatHeading>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: space(2.5),
        }}
      >
        <MiniStory frame={frame} />
        <div style={{ width: 280 }}>
          <div
            style={{
              height: 10,
              borderRadius: 999,
              backgroundColor: social.border,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                backgroundColor: social.navy,
              }}
            />
          </div>
          <div
            style={{
              marginTop: space(1),
              fontFamily: fontMono,
              fontSize: 24,
              color: social.muted,
              textAlign: "center",
            }}
          >
            frame {counter} / 150
          </div>
        </div>
      </div>
    </>
  );
}

/** Miniature of the real match-result story template, assembling in steps. */
export function MiniStory({
  frame,
  width = 250,
}: {
  frame: number;
  width?: number;
}) {
  const step = (at: number, base = 1) => ({
    opacity:
      base *
      interpolate(frame, [at, at + 12], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
  });
  return (
    <div
      style={{
        width,
        height: width * 1.78,
        borderRadius: 18,
        backgroundImage: brandGradient,
        color: "#fff",
        padding: space(2.5),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: space(1.5),
        boxShadow: "0 24px 60px rgba(9, 11, 12, 0.18)",
      }}
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          ...step(20, 0.75),
        }}
      >
        Resultado final
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: space(1),
          ...step(40),
        }}
      >
        <TeamDot name="Chapela" size={22} />
        <span style={{ fontSize: 22, fontWeight: 700 }}>Chapela</span>
      </div>
      <span style={{ fontSize: 52, fontWeight: 800, ...step(70) }}>2 – 1</span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: space(1),
          ...step(55),
        }}
      >
        <TeamDot name="Cesantes FC" size={22} />
        <span style={{ fontSize: 22, fontWeight: 700 }}>Cesantes FC</span>
      </div>
      <span style={{ fontSize: 14, ...step(85, 0.7) }}>
        Pista de A Xunqueira · Redondela
      </span>
    </div>
  );
}

/* --------------------------- beat 5e: publish --------------------------- */

const TARGETS = [
  { label: "Web", at: 55 },
  { label: "Instagram", at: 72 },
  { label: "Facebook", at: 85 },
];

function PublishBeat() {
  const frame = useCurrentFrame();
  // The mini story flies down into the Instagram pill.
  const fly = interpolate(frame, [30, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <BeatHeading>
        Live on the site.
        <br />
        Posted to Instagram & Facebook.
      </BeatHeading>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: space(4),
        }}
      >
        <div
          style={{
            height: 260,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              transform: `translateY(${fly * 150}px) scale(${1 - fly * 0.75})`,
              opacity: 1 - fly * 0.9,
            }}
          >
            <MiniStory frame={200} width={150} />
          </div>
        </div>
        <div style={{ display: "flex", gap: space(2.5) }}>
          {TARGETS.map((target) => {
            const done = frame >= target.at;
            return (
              <Pill key={target.label} filled={done} fontSize={36}>
                {target.label}
                {done ? " ✓" : ""}
              </Pill>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Punchline() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: social.background,
        justifyContent: "center",
        alignItems: "center",
        opacity: interpolate(frame, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div
        style={{
          fontSize: 110,
          fontWeight: 800,
          letterSpacing: -3,
          lineHeight: 1.05,
          color: social.ink,
          textAlign: "center",
          maxWidth: 1400,
          scale: String(
            interpolate(frame, [0, 14], [0.94, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          ),
        }}
      >
        Nobody opened
        <br />
        an admin panel.
      </div>
    </AbsoluteFill>
  );
}
