CREATE TYPE "public"."video_generation_job_kind" AS ENUM('video', 'image');--> statement-breakpoint
CREATE TYPE "public"."video_generation_job_status" AS ENUM('queued', 'running', 'succeeded', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "video_generation_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" text NOT NULL,
	"kind" "video_generation_job_kind" NOT NULL,
	"input_props" jsonb NOT NULL,
	"status" "video_generation_job_status" DEFAULT 'queued' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"locked_at" timestamp,
	"locked_by" text,
	"started_at" timestamp,
	"finished_at" timestamp,
	"failed_at" timestamp,
	"error_message" text,
	"output_path" text,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "video_generation_job" ADD CONSTRAINT "video_generation_job_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "video_generation_job_status_idx" ON "video_generation_job" USING btree ("status");--> statement-breakpoint
CREATE INDEX "video_generation_job_queue_idx" ON "video_generation_job" USING btree ("status","priority","created_at");--> statement-breakpoint
CREATE INDEX "video_generation_job_createdByUserId_idx" ON "video_generation_job" USING btree ("created_by_user_id");