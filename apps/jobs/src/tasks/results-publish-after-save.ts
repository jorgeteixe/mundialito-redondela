import { randomUUID } from "node:crypto";
import { logger, task } from "@trigger.dev/sdk";
import {
  createSocialPost,
  listResultPublishingMatches,
  listPublicGroupStandings,
  type ResultPublishingMatch,
  type SocialPlatform,
} from "@mr/db";
import {
  RESULTS_PUBLISH_AFTER_SAVE_TASK_ID,
  type ResultsPublishAfterSaveOutput,
  type ResultsPublishAfterSavePayload,
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

function phaseLabel(stage: "f1" | "f2" | null) {
  return stage === "f2" ? "Fase 2" : "Fase 1";
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

function isFinished(match: MatchRow) {
  if (match.homeScore == null || match.awayScore == null) return false;
  if (
    match.kind !== "group" &&
    match.homeScore === match.awayScore &&
    (match.homePenalties == null || match.awayPenalties == null)
  ) {
    return false;
  }
  return true;
}

function resultStoryProps(match: MatchRow) {
  const group = match.kind === "group" ? match.groupName : undefined;
  const phase =
    match.kind === "group"
      ? phaseLabel(match.groupStage)
      : knockoutLabel(match.kind);

  return {
    eyebrow: "Resultado final",
    home: {
      name: teamName(match, "home"),
      score: match.homeScore ?? 0,
      penaltyScore: match.homePenalties ?? undefined,
    },
    away: {
      name: teamName(match, "away"),
      score: match.awayScore ?? 0,
      penaltyScore: match.awayPenalties ?? undefined,
    },
    category: match.category,
    categoryLabel: categoryLabel(match.category),
    phase,
    group,
    note: `${teamName(match, "home")} ${match.homeScore ?? 0}-${match.awayScore ?? 0} ${teamName(match, "away")}`,
    venue: VENUE,
  };
}

function dayResultsProps(matches: MatchRow[], label: string) {
  return {
    eyebrow: "Resultados de hoy",
    date: label,
    venue: VENUE,
    matches: matches.slice(0, 6).map((match) => ({
      time: timeFormatter.format(match.scheduledAt),
      home: teamName(match, "home"),
      away: teamName(match, "away"),
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
      homePenaltyScore: match.homePenalties ?? undefined,
      awayPenaltyScore: match.awayPenalties ?? undefined,
      category: match.category,
      categoryLabel: categoryLabel(match.category),
      group:
        match.kind === "group"
          ? (match.groupName ?? undefined)
          : knockoutLabel(match.kind),
    })),
  };
}

function standingsQualifyCount(stage: "f1" | "f2") {
  return stage === "f1" ? 3 : 1;
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

async function createStoryPost(match: MatchRow) {
  const { post } = await createSocialPost({
    postType: "story",
    mediaKind: "video",
    caption: resultStoryProps(match).note ?? "",
    scheduledAt: new Date(),
    platforms: ["instagram"],
  });

  await publicationPublish.trigger({
    postId: post.id,
    render: {
      templateId: "match-result-story",
      inputProps: resultStoryProps(match),
    },
  });

  return post.id;
}

async function createDayCarouselPost(matches: MatchRow[], label: string) {
  const urls: string[] = [];
  urls.push(
    await renderImage("daily-results-post", dayResultsProps(matches, label)),
  );

  const groupIds = new Set(
    matches
      .filter((match) => match.kind === "group" && match.groupId)
      .map((match) => match.groupId as string),
  );

  const stages = new Set(
    matches
      .filter((match) => match.kind === "group" && match.groupStage)
      .map((match) => match.groupStage as "f1" | "f2"),
  );

  for (const stage of stages) {
    const standings = await listPublicGroupStandings(stage);
    for (const group of standings.filter((candidate) =>
      groupIds.has(candidate.id),
    )) {
      urls.push(
        await renderImage("group-standings-post", {
          eyebrow: "Clasificación",
          groupName: group.name,
          phase: phaseLabel(group.stage),
          category: group.category,
          categoryLabel: categoryLabel(group.category),
          venue: VENUE,
          qualifyCount: standingsQualifyCount(group.stage),
          rows: group.standings,
        }),
      );
    }
  }

  const platforms: SocialPlatform[] = ["instagram", "facebook"];
  const { post, targets } = await createSocialPost({
    postType: "feed",
    mediaKind: "image",
    caption: `Resultados ${label}`,
    scheduledAt: new Date(),
    platforms,
    mediaUrls: urls,
  });

  await socialPublish.batchTrigger(
    targets.map((target) => ({ payload: { targetId: target.id } })),
  );

  return { postId: post.id, imageCount: urls.length };
}

export const publishAfterResultSave = task({
  id: RESULTS_PUBLISH_AFTER_SAVE_TASK_ID,
  run: async (
    payload: ResultsPublishAfterSavePayload,
  ): Promise<ResultsPublishAfterSaveOutput> => {
    const matches = await listResultPublishingMatches();
    const savedMatch = matches.find((match) => match.id === payload.matchId);
    if (!savedMatch) throw new Error(`Match ${payload.matchId} not found.`);

    if (!isFinished(savedMatch)) {
      logger.info("Result publish skipped: match is not complete", {
        matchId: payload.matchId,
      });
      return {
        matchId: payload.matchId,
        storyPostId: null,
        dayPostId: null,
        dayComplete: false,
        renderedImageCount: 0,
      };
    }

    const storyPostId = await createStoryPost(savedMatch);

    const savedDayKey = dayKey(savedMatch.scheduledAt);
    const dayMatches = matches.filter(
      (match) => dayKey(match.scheduledAt) === savedDayKey,
    );
    const dayComplete = dayMatches.length > 0 && dayMatches.every(isFinished);

    if (!dayComplete) {
      return {
        matchId: payload.matchId,
        storyPostId,
        dayPostId: null,
        dayComplete,
        renderedImageCount: 0,
      };
    }

    const dayPost = await createDayCarouselPost(
      dayMatches,
      dayLabel(savedMatch.scheduledAt),
    );

    return {
      matchId: payload.matchId,
      storyPostId,
      dayPostId: dayPost.postId,
      dayComplete,
      renderedImageCount: dayPost.imageCount,
    };
  },
});
