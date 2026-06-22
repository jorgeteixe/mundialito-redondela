import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { videoGenerationJob } from "./video";

export const socialPlatformEnum = pgEnum("social_platform", [
  "instagram",
  "facebook",
]);

export const socialPostTypeEnum = pgEnum("social_post_type", [
  "feed",
  "reel",
  "story",
]);

export const socialMediaKindEnum = pgEnum("social_media_kind", [
  "image",
  "video",
]);

export const socialPostTargetStatusEnum = pgEnum("social_post_target_status", [
  "scheduled",
  "publishing",
  "published",
  "failed",
  "cancelled",
]);

// The publication content / intent — one row per publication the user creates.
export const socialPost = pgTable("social_post", {
  id: uuid("id").primaryKey().defaultRandom(),
  postType: socialPostTypeEnum("post_type").notNull(),
  mediaKind: socialMediaKindEnum("media_kind").notNull(),
  caption: text("caption").notNull().default(""),
  // Media comes from either a render job (referenced or newly enqueued) or a
  // direct public URL. The worker resolves whichever is set.
  videoJobId: uuid("video_job_id").references(() => videoGenerationJob.id, {
    onDelete: "set null",
  }),
  mediaUrl: text("media_url"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  createdByUserId: text("created_by_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// The per-platform delivery job — this is the queue item the worker claims.
export const socialPostTarget = pgTable(
  "social_post_target",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => socialPost.id, { onDelete: "cascade" }),
    platform: socialPlatformEnum("platform").notNull(),
    status: socialPostTargetStatusEnum("status").default("scheduled").notNull(),
    // Copied from the post so the claim query can index on it directly.
    scheduledAt: timestamp("scheduled_at").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    lockedAt: timestamp("locked_at"),
    lockedBy: text("locked_by"),
    // IG creation_id held between the create and publish steps of the async flow.
    providerContainerId: text("provider_container_id"),
    // The published media id returned by the provider.
    providerPostId: text("provider_post_id"),
    // Public permalink to the published post (for the "open post" action).
    providerPermalink: text("provider_permalink"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
    failedAt: timestamp("failed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("social_post_target_status_idx").on(table.status),
    index("social_post_target_queue_idx").on(table.status, table.scheduledAt),
    index("social_post_target_postId_idx").on(table.postId),
  ],
);

export const socialPostRelations = relations(socialPost, ({ one, many }) => ({
  createdByUser: one(user, {
    fields: [socialPost.createdByUserId],
    references: [user.id],
  }),
  videoJob: one(videoGenerationJob, {
    fields: [socialPost.videoJobId],
    references: [videoGenerationJob.id],
  }),
  targets: many(socialPostTarget),
}));

export const socialPostTargetRelations = relations(
  socialPostTarget,
  ({ one }) => ({
    post: one(socialPost, {
      fields: [socialPostTarget.postId],
      references: [socialPost.id],
    }),
  }),
);
