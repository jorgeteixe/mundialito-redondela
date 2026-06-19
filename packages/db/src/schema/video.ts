import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const videoGenerationJobStatusEnum = pgEnum(
  "video_generation_job_status",
  ["queued", "running", "succeeded", "failed", "cancelled"],
);

export const videoGenerationJobKindEnum = pgEnum("video_generation_job_kind", [
  "video",
  "image",
]);

export const videoGenerationJob = pgTable(
  "video_generation_job",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    templateId: text("template_id").notNull(),
    kind: videoGenerationJobKindEnum("kind").notNull(),
    inputProps: jsonb("input_props").notNull().$type<Record<string, unknown>>(),
    status: videoGenerationJobStatusEnum("status").default("queued").notNull(),
    priority: integer("priority").default(0).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    lockedAt: timestamp("locked_at"),
    lockedBy: text("locked_by"),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
    failedAt: timestamp("failed_at"),
    errorMessage: text("error_message"),
    outputPath: text("output_path"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("video_generation_job_status_idx").on(table.status),
    index("video_generation_job_queue_idx").on(
      table.status,
      table.priority,
      table.createdAt,
    ),
    index("video_generation_job_createdByUserId_idx").on(table.createdByUserId),
  ],
);

export const videoGenerationJobRelations = relations(
  videoGenerationJob,
  ({ one }) => ({
    createdByUser: one(user, {
      fields: [videoGenerationJob.createdByUserId],
      references: [user.id],
    }),
  }),
);
