CREATE TYPE "public"."group_stage" AS ENUM('f1', 'f2');--> statement-breakpoint
CREATE TYPE "public"."match_kind" AS ENUM('group', 'semifinal', 'third_place', 'final');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'live', 'finished', 'postponed');--> statement-breakpoint
CREATE TABLE "tournament_group_team" (
	"group_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"stage" "group_stage" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tournament_group_team_group_id_team_id_pk" PRIMARY KEY("group_id","team_id")
);
--> statement-breakpoint
ALTER TABLE "match" DROP CONSTRAINT "match_home_team_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "match" DROP CONSTRAINT "match_away_team_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "team" DROP CONSTRAINT "team_group_id_tournament_group_id_fk";
--> statement-breakpoint
DROP INDEX "team_groupId_idx";--> statement-breakpoint
ALTER TABLE "match" ALTER COLUMN "group_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ALTER COLUMN "home_team_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ALTER COLUMN "away_team_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN "category" "category" DEFAULT 'senior' NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN "kind" "match_kind" DEFAULT 'group' NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN "status" "match_status" DEFAULT 'scheduled' NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN "home_placeholder" text;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN "away_placeholder" text;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN "home_score" integer;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN "away_score" integer;--> statement-breakpoint
ALTER TABLE "tournament_group" ADD COLUMN "stage" "group_stage" DEFAULT 'f1' NOT NULL;--> statement-breakpoint
ALTER TABLE "tournament_group_team" ADD CONSTRAINT "tournament_group_team_group_id_tournament_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."tournament_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_group_team" ADD CONSTRAINT "tournament_group_team_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tournament_group_team_team_stage_idx" ON "tournament_group_team" USING btree ("team_id","stage");--> statement-breakpoint
CREATE INDEX "tournament_group_team_groupId_idx" ON "tournament_group_team" USING btree ("group_id");--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_home_team_id_team_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_away_team_id_team_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "match_category_scheduledAt_idx" ON "match" USING btree ("category","scheduled_at");--> statement-breakpoint
CREATE INDEX "match_kind_idx" ON "match" USING btree ("kind");--> statement-breakpoint
ALTER TABLE "team" DROP COLUMN "group_id";