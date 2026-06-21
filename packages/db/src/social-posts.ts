import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./client";
import { socialPost, socialPostTarget } from "./schema/social";
import { videoGenerationJob } from "./schema/video";

export type SocialProvider = "meta";
export type SocialPlatform = "instagram" | "facebook";
export type SocialPostType = "feed" | "reel" | "story";
export type SocialMediaKind = "image" | "video";
export type SocialPostTargetStatus =
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "cancelled";

export type SocialPost = typeof socialPost.$inferSelect;
export type SocialPostTarget = typeof socialPostTarget.$inferSelect;

export type CreateSocialPostInput = {
  postType: SocialPostType;
  mediaKind: SocialMediaKind;
  caption: string;
  scheduledAt: Date;
  platforms: SocialPlatform[];
  videoJobId?: string | null;
  mediaUrl?: string | null;
  provider?: SocialProvider;
  createdByUserId?: string | null;
  maxAttempts?: number;
};

export async function createSocialPost(input: CreateSocialPostInput) {
  return db.transaction(async (tx) => {
    const [post] = await tx
      .insert(socialPost)
      .values({
        postType: input.postType,
        mediaKind: input.mediaKind,
        caption: input.caption,
        scheduledAt: input.scheduledAt,
        videoJobId: input.videoJobId ?? null,
        mediaUrl: input.mediaUrl ?? null,
        createdByUserId: input.createdByUserId ?? null,
      })
      .returning();

    if (!post) throw new Error("Failed to create social post");

    const targets = await tx
      .insert(socialPostTarget)
      .values(
        input.platforms.map((platform) => ({
          postId: post.id,
          provider: input.provider ?? ("meta" as const),
          platform,
          scheduledAt: input.scheduledAt,
          maxAttempts: input.maxAttempts ?? 3,
        })),
      )
      .returning();

    return { post, targets };
  });
}

export type SocialPostWithTargets = SocialPost & {
  targets: SocialPostTarget[];
  videoJob: {
    id: string;
    status: string;
    outputPath: string | null;
  } | null;
};

export async function listSocialPosts(
  limit = 50,
): Promise<SocialPostWithTargets[]> {
  const posts = await db.query.socialPost.findMany({
    limit,
    orderBy: desc(socialPost.createdAt),
    with: {
      targets: true,
      videoJob: {
        columns: { id: true, status: true, outputPath: true },
      },
    },
  });

  return posts as SocialPostWithTargets[];
}

export async function getSocialPost(id: string) {
  return (
    (await db.query.socialPost.findFirst({
      where: eq(socialPost.id, id),
      with: {
        targets: true,
        videoJob: {
          columns: { id: true, status: true, outputPath: true },
        },
      },
    })) ?? null
  );
}

// Resolved media context the worker needs to publish a claimed target.
export type SocialPostMediaContext = {
  post: SocialPost;
  videoOutputPath: string | null;
};

export async function getSocialPostMediaContext(
  postId: string,
): Promise<SocialPostMediaContext | null> {
  const rows = await db
    .select({
      post: socialPost,
      videoOutputPath: videoGenerationJob.outputPath,
    })
    .from(socialPost)
    .leftJoin(
      videoGenerationJob,
      eq(videoGenerationJob.id, socialPost.videoJobId),
    )
    .where(eq(socialPost.id, postId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return { post: row.post, videoOutputPath: row.videoOutputPath ?? null };
}

const targetReturningColumns = sql`
  id,
  post_id as "postId",
  provider,
  platform,
  status,
  scheduled_at as "scheduledAt",
  attempts,
  max_attempts as "maxAttempts",
  locked_at as "lockedAt",
  locked_by as "lockedBy",
  provider_container_id as "providerContainerId",
  provider_post_id as "providerPostId",
  provider_permalink as "providerPermalink",
  error_message as "errorMessage",
  started_at as "startedAt",
  finished_at as "finishedAt",
  failed_at as "failedAt",
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

// Claims the next due target whose media is ready: either a direct mediaUrl
// (no referenced job) or a referenced render job that has succeeded.
export async function claimNextSocialPostTarget(workerId: string) {
  const rows = await db.execute<SocialPostTarget>(sql`
    update ${socialPostTarget}
    set
      status = 'publishing',
      attempts = ${socialPostTarget.attempts} + 1,
      locked_at = now(),
      locked_by = ${workerId},
      started_at = coalesce(${socialPostTarget.startedAt}, now()),
      failed_at = null,
      error_message = null,
      updated_at = now()
    where ${socialPostTarget.id} = (
      select ${socialPostTarget.id}
      from ${socialPostTarget}
      join ${socialPost} on ${socialPost.id} = ${socialPostTarget.postId}
      left join ${videoGenerationJob}
        on ${videoGenerationJob.id} = ${socialPost.videoJobId}
      where
        ${socialPostTarget.status} = 'scheduled'
        and ${socialPostTarget.scheduledAt} <= now()
        and ${socialPostTarget.attempts} < ${socialPostTarget.maxAttempts}
        and (
          ${socialPost.videoJobId} is null
          or ${videoGenerationJob.status} = 'succeeded'
        )
      order by ${socialPostTarget.scheduledAt} asc
      -- Lock only the target row; the left-joined media table is on the
      -- nullable side and cannot be locked.
      for update of ${socialPostTarget} skip locked
      limit 1
    )
    returning ${targetReturningColumns}
  `);

  return rows[0] ?? null;
}

export async function setSocialPostTargetContainer(
  id: string,
  containerId: string,
) {
  const [target] = await db
    .update(socialPostTarget)
    .set({ providerContainerId: containerId })
    .where(eq(socialPostTarget.id, id))
    .returning();

  return target ?? null;
}

export async function markSocialPostTargetPublished(
  id: string,
  providerPostId: string,
  providerPermalink?: string | null,
) {
  const [target] = await db
    .update(socialPostTarget)
    .set({
      status: "published",
      providerPostId,
      providerPermalink: providerPermalink ?? null,
      lockedAt: null,
      lockedBy: null,
      finishedAt: new Date(),
      errorMessage: null,
    })
    .where(eq(socialPostTarget.id, id))
    .returning();

  return target ?? null;
}

export async function markSocialPostTargetFailed(
  id: string,
  errorMessage: string,
  options: { retryable?: boolean } = {},
) {
  const rows = await db.execute<SocialPostTarget>(sql`
    update ${socialPostTarget}
    set
      status = case
        when ${options.retryable === false}
          then 'failed'::social_post_target_status
        when ${socialPostTarget.attempts} >= ${socialPostTarget.maxAttempts}
          then 'failed'::social_post_target_status
        else 'scheduled'::social_post_target_status
      end,
      locked_at = null,
      locked_by = null,
      failed_at = now(),
      error_message = ${errorMessage},
      updated_at = now()
    where ${socialPostTarget.id} = ${id}
    returning ${targetReturningColumns}
  `);

  return rows[0] ?? null;
}

// Cancels every still-pending target of a publication.
export async function cancelSocialPost(id: string) {
  return db
    .update(socialPostTarget)
    .set({
      status: "cancelled",
      lockedAt: null,
      lockedBy: null,
      finishedAt: new Date(),
    })
    .where(
      and(
        eq(socialPostTarget.postId, id),
        inArray(socialPostTarget.status, ["scheduled", "failed"]),
      ),
    )
    .returning();
}

export async function retrySocialPostTarget(id: string) {
  const [target] = await db
    .update(socialPostTarget)
    .set({
      status: "scheduled",
      attempts: 0,
      lockedAt: null,
      lockedBy: null,
      failedAt: null,
      finishedAt: null,
      errorMessage: null,
      providerContainerId: null,
    })
    .where(
      and(eq(socialPostTarget.id, id), eq(socialPostTarget.status, "failed")),
    )
    .returning();

  return target ?? null;
}

// Succeeded render jobs available to attach to a publication.
export async function listPublishableMedia(limit = 50) {
  return db
    .select({
      id: videoGenerationJob.id,
      kind: videoGenerationJob.kind,
      templateId: videoGenerationJob.templateId,
      outputPath: videoGenerationJob.outputPath,
      createdAt: videoGenerationJob.createdAt,
    })
    .from(videoGenerationJob)
    .where(eq(videoGenerationJob.status, "succeeded"))
    .orderBy(desc(videoGenerationJob.createdAt))
    .limit(limit);
}
