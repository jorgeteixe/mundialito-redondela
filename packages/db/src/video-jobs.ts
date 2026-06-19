import { desc, eq, sql } from "drizzle-orm";
import { db } from "./client";
import { videoGenerationJob } from "./schema/video";

export type VideoGenerationJobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export type VideoGenerationJobKind = "video" | "image";

export type VideoGenerationJob = typeof videoGenerationJob.$inferSelect;

export type EnqueueVideoGenerationJobInput = {
  templateId: string;
  kind: VideoGenerationJobKind;
  inputProps: Record<string, unknown>;
  createdByUserId?: string | null;
  priority?: number;
  maxAttempts?: number;
};

export async function enqueueVideoGenerationJob(
  input: EnqueueVideoGenerationJobInput,
) {
  const [job] = await db
    .insert(videoGenerationJob)
    .values({
      templateId: input.templateId,
      kind: input.kind,
      inputProps: input.inputProps,
      createdByUserId: input.createdByUserId ?? null,
      priority: input.priority ?? 0,
      maxAttempts: input.maxAttempts ?? 3,
    })
    .returning();

  return job;
}

export async function listVideoGenerationJobs(limit = 50) {
  return db
    .select()
    .from(videoGenerationJob)
    .orderBy(desc(videoGenerationJob.createdAt))
    .limit(limit);
}

export async function getVideoGenerationJob(id: string) {
  const [job] = await db
    .select()
    .from(videoGenerationJob)
    .where(eq(videoGenerationJob.id, id))
    .limit(1);

  return job ?? null;
}

export async function claimNextVideoGenerationJob(workerId: string) {
  const rows = await db.execute<VideoGenerationJob>(sql`
    update ${videoGenerationJob}
    set
      status = 'running',
      attempts = ${videoGenerationJob.attempts} + 1,
      locked_at = now(),
      locked_by = ${workerId},
      started_at = coalesce(${videoGenerationJob.startedAt}, now()),
      failed_at = null,
      error_message = null,
      updated_at = now()
    where ${videoGenerationJob.id} = (
      select ${videoGenerationJob.id}
      from ${videoGenerationJob}
      where
        ${videoGenerationJob.status} = 'queued'
        and ${videoGenerationJob.attempts} < ${videoGenerationJob.maxAttempts}
      order by ${videoGenerationJob.priority} desc, ${videoGenerationJob.createdAt} asc
      for update skip locked
      limit 1
    )
    returning
      id,
      template_id as "templateId",
      kind,
      input_props as "inputProps",
      status,
      priority,
      attempts,
      max_attempts as "maxAttempts",
      locked_at as "lockedAt",
      locked_by as "lockedBy",
      started_at as "startedAt",
      finished_at as "finishedAt",
      failed_at as "failedAt",
      error_message as "errorMessage",
      output_path as "outputPath",
      created_by_user_id as "createdByUserId",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `);

  return rows[0] ?? null;
}

export async function markVideoGenerationJobSucceeded(
  id: string,
  outputPath: string,
) {
  const [job] = await db
    .update(videoGenerationJob)
    .set({
      status: "succeeded",
      outputPath,
      lockedAt: null,
      lockedBy: null,
      finishedAt: new Date(),
      errorMessage: null,
    })
    .where(eq(videoGenerationJob.id, id))
    .returning();

  return job ?? null;
}

export async function markVideoGenerationJobFailed(
  id: string,
  errorMessage: string,
) {
  const rows = await db.execute<VideoGenerationJob>(sql`
    update ${videoGenerationJob}
    set
      status = case
        when ${videoGenerationJob.attempts} >= ${videoGenerationJob.maxAttempts}
          then 'failed'::video_generation_job_status
        else 'queued'::video_generation_job_status
      end,
      locked_at = null,
      locked_by = null,
      failed_at = now(),
      error_message = ${errorMessage},
      updated_at = now()
    where ${videoGenerationJob.id} = ${id}
    returning
      id,
      template_id as "templateId",
      kind,
      input_props as "inputProps",
      status,
      priority,
      attempts,
      max_attempts as "maxAttempts",
      locked_at as "lockedAt",
      locked_by as "lockedBy",
      started_at as "startedAt",
      finished_at as "finishedAt",
      failed_at as "failedAt",
      error_message as "errorMessage",
      output_path as "outputPath",
      created_by_user_id as "createdByUserId",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `);

  return rows[0] ?? null;
}

export async function cancelQueuedVideoGenerationJob(id: string) {
  const [job] = await db
    .update(videoGenerationJob)
    .set({
      status: "cancelled",
      lockedAt: null,
      lockedBy: null,
      finishedAt: new Date(),
    })
    .where(
      sql`${videoGenerationJob.id} = ${id} and ${videoGenerationJob.status} = 'queued'`,
    )
    .returning();

  return job ?? null;
}

export async function retryVideoGenerationJob(id: string) {
  const [job] = await db
    .update(videoGenerationJob)
    .set({
      status: "queued",
      lockedAt: null,
      lockedBy: null,
      failedAt: null,
      finishedAt: null,
      errorMessage: null,
    })
    .where(
      sql`${videoGenerationJob.id} = ${id} and ${videoGenerationJob.status} = 'failed'`,
    )
    .returning();

  return job ?? null;
}
