CREATE TYPE "public"."social_media_kind" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."social_platform" AS ENUM('instagram', 'facebook');--> statement-breakpoint
CREATE TYPE "public"."social_post_target_status" AS ENUM('scheduled', 'publishing', 'published', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."social_post_type" AS ENUM('feed', 'reel', 'story');--> statement-breakpoint
CREATE TYPE "public"."social_provider" AS ENUM('meta');--> statement-breakpoint
CREATE TABLE "social_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_type" "social_post_type" NOT NULL,
	"media_kind" "social_media_kind" NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"video_job_id" uuid,
	"media_url" text,
	"scheduled_at" timestamp NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_post_target" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"provider" "social_provider" DEFAULT 'meta' NOT NULL,
	"platform" "social_platform" NOT NULL,
	"status" "social_post_target_status" DEFAULT 'scheduled' NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"locked_at" timestamp,
	"locked_by" text,
	"provider_container_id" text,
	"provider_post_id" text,
	"error_message" text,
	"started_at" timestamp,
	"finished_at" timestamp,
	"failed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "social_post" ADD CONSTRAINT "social_post_video_job_id_video_generation_job_id_fk" FOREIGN KEY ("video_job_id") REFERENCES "public"."video_generation_job"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_post" ADD CONSTRAINT "social_post_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_post_target" ADD CONSTRAINT "social_post_target_post_id_social_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."social_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "social_post_target_status_idx" ON "social_post_target" USING btree ("status");--> statement-breakpoint
CREATE INDEX "social_post_target_queue_idx" ON "social_post_target" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "social_post_target_postId_idx" ON "social_post_target" USING btree ("post_id");