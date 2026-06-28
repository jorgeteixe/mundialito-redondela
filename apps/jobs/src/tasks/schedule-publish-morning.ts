import { randomUUID } from "node:crypto";
import { logger, schedules } from "@trigger.dev/sdk";
import {
  createSocialPost,
  listResultPublishingMatches,
  type ResultPublishingMatch,
  type SocialPlatform,
} from "@mr/db";
import {
  SCHEDULE_PUBLISH_MORNING_TASK_ID,
  type SchedulePublishMorningOutput,
} from "../contracts";
import { publicationPublish } from "./publication-publish";
import { renderMedia } from "./render-media";
import { socialPublish } from "./social-publish";

const TIME_ZONE = "Europe/Madrid";
const VENUE = "Pista de A Xunqueira, Redondela";

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dayLabelFormatter = new Intl.DateTimeFormat("es-ES", {
  timeZone: TIME_ZONE,
  weekday: "long",
});

const dayNumberFormatter = new Intl.DateTimeFormat("es-ES", {
  timeZone: TIME_ZONE,
  day: "numeric",
});

const monthLabelFormatter = new Intl.DateTimeFormat("es-ES", {
  timeZone: TIME_ZONE,
  month: "long",
});

const timeFormatter = new Intl.DateTimeFormat("es-ES", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

type MatchRow = ResultPublishingMatch;

function categoryLabel(category: "senior" | "cadet") {
  return category === "senior" ? "Senior" : "Cadete";
}

function knockoutLabel(kind: MatchRow["kind"]) {
  if (kind === "semifinal") return "Semifinal";
  if (kind === "third_place") return "3.º-4.º puesto";
  if (kind === "final") return "Final";
  return "Eliminatorias";
}

function teamName(match: MatchRow, side: "home" | "away") {
  if (side === "home") {
    return match.homeTeamName ?? match.homePlaceholder ?? "Pendiente";
  }
  return match.awayTeamName ?? match.awayPlaceholder ?? "Pendiente";
}

function dayKey(date: Date) {
  return dayKeyFormatter.format(date);
}

function dayLabel(date: Date) {
  return `${dayLabelFormatter.format(date)}, ${dayNumberFormatter.format(date)} ${monthLabelFormatter.format(date)}`;
}

function scheduleCaption(label: string) {
  return [
    `📅 ¡Partidos de hoy, ${label}! ⚽🏆`,
    "",
    "Hoy se juega en el Mundialito da Xunqueira. Estos son los horarios y enfrentamientos. ¡No te lo pierdas! 👇🏻",
    "",
    `📍 ${VENUE}`,
    "",
    "#MundialitoDaXunqueira #Redondela",
  ].join("\n");
}

function scheduleProps(matches: MatchRow[], label: string) {
  return {
    eyebrow: "Partidos de hoy",
    date: label,
    venue: VENUE,
    matches: matches.slice(0, 6).map((match) => ({
      time: timeFormatter.format(match.scheduledAt),
      home: teamName(match, "home"),
      away: teamName(match, "away"),
      category: match.category,
      categoryLabel: categoryLabel(match.category),
      group:
        match.kind === "group"
          ? (match.groupName ?? undefined)
          : knockoutLabel(match.kind),
    })),
  };
}

async function renderImage(
  templateId: string,
  inputProps: Record<string, unknown>,
) {
  const result = await renderMedia
    .triggerAndWait({
      id: randomUUID(),
      templateId,
      inputProps,
    })
    .unwrap();

  if (result.kind !== "image" || !result.publicPath) {
    throw new Error(`Render ${templateId} did not produce an image.`);
  }

  return result.publicPath;
}

async function createScheduleStory(matches: MatchRow[], label: string) {
  const { post } = await createSocialPost({
    postType: "story",
    mediaKind: "video",
    caption: scheduleCaption(label),
    scheduledAt: new Date(),
    platforms: ["instagram"],
  });

  await publicationPublish.trigger({
    postId: post.id,
    render: {
      templateId: "daily-schedule",
      inputProps: scheduleProps(matches, label),
    },
  });

  return post.id;
}

async function createSchedulePost(matches: MatchRow[], label: string) {
  const url = await renderImage(
    "daily-schedule-post",
    scheduleProps(matches, label),
  );

  const platforms: SocialPlatform[] = ["instagram", "facebook"];
  const { post, targets } = await createSocialPost({
    postType: "feed",
    mediaKind: "image",
    caption: scheduleCaption(label),
    scheduledAt: new Date(),
    platforms,
    mediaUrls: [url],
  });

  await socialPublish.batchTrigger(
    targets.map((target) => ({ payload: { targetId: target.id } })),
  );

  return post.id;
}

export const publishMorningSchedule = schedules.task({
  id: SCHEDULE_PUBLISH_MORNING_TASK_ID,
  // 10:00 every day, Madrid time. Publishes the day's fixtures only when there
  // are matches scheduled today.
  cron: { pattern: "0 10 * * *", timezone: TIME_ZONE },
  run: async (payload): Promise<SchedulePublishMorningOutput> => {
    const today = dayKey(payload.timestamp);
    const matches = await listResultPublishingMatches();
    const todayMatches = matches.filter(
      (match) => dayKey(match.scheduledAt) === today,
    );

    if (todayMatches.length === 0) {
      logger.info("Morning schedule skipped: no matches today", { today });
      return {
        date: today,
        hasMatches: false,
        storyPostId: null,
        postId: null,
        matchCount: 0,
      };
    }

    const label = dayLabel(payload.timestamp);
    const storyPostId = await createScheduleStory(todayMatches, label);
    const postId = await createSchedulePost(todayMatches, label);

    return {
      date: today,
      hasMatches: true,
      storyPostId,
      postId,
      matchCount: todayMatches.length,
    };
  },
});
