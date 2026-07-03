/**
 * Voice-over script, one line per beat, kept next to the timeline so a future
 * TTS pass (e.g. ElevenLabs) can consume it without touching the component.
 * Keys match SHOWCASE_SCENES / LOOP_BEATS in schema.ts.
 */
export const VO_SCRIPT: { beat: string; text: string }[] = [
  {
    beat: "coldOpen",
    text: "Every summer, a street futsal tournament takes over one court in Redondela — forty-seven editions and counting.",
  },
  {
    beat: "paper",
    text: "There was no way to follow it online. The results lived on a paper taped to the wall of the bar next to the court.",
  },
  {
    beat: "relay",
    text: "Scores traveled by WhatsApp — two directors per team, forwarding results one to another.",
  },
  {
    beat: "turnWant",
    text: "Meanwhile, I just wanted an excuse to play with video generation and AI agents.",
  },
  {
    beat: "turnInsight",
    text: "And I knew nobody would ever open an admin panel — but everyone sends messages.",
  },
  {
    beat: "loop.chat",
    text: "Someone types the score into the Telegram group — and an agent reads it and works out exactly which match it was.",
  },
  {
    beat: "loop.confirm",
    text: "One tap to confirm — because from here, it goes live everywhere.",
  },
  {
    beat: "loop.core",
    text: "One shared function writes the score and re-resolves standings and brackets — same code the admin panel uses.",
  },
  {
    beat: "loop.render",
    text: "Trigger.dev kicks off a Remotion render, and a result video builds itself frame by frame.",
  },
  {
    beat: "loop.publish",
    text: "The site updates instantly, the video posts to Instagram and Facebook — and nobody opened an admin panel.",
  },
  {
    beat: "breadth",
    text: "Around the loop: a live public site, a full backstage, and daily posts and reminders on cron.",
  },
  {
    beat: "close",
    text: "I got to learn some new tools — and the tournament got live scores. Code's on GitHub.",
  },
];

export const REPO = "github.com/jorgeteixe/mundialito-redondela";

export const STACK = [
  "Next.js",
  "Drizzle + Postgres",
  "Trigger.dev",
  "Remotion",
  "Mastra + Gemini",
  "Postiz",
];
