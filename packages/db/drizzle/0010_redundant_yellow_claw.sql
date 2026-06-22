CREATE TABLE IF NOT EXISTS "match" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"home_team_id" uuid NOT NULL,
	"away_team_id" uuid NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN IF NOT EXISTS "group_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN IF NOT EXISTS "home_team_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN IF NOT EXISTS "away_team_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN IF NOT EXISTS "scheduled_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'match'
			AND column_name = 'scheduled_at'
			AND data_type <> 'timestamp with time zone'
	) THEN
		ALTER TABLE "match" ALTER COLUMN "scheduled_at" SET DATA TYPE timestamp with time zone USING "scheduled_at" AT TIME ZONE 'Europe/Madrid';
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "match" ADD CONSTRAINT "match_group_id_tournament_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."tournament_group"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "match" ADD CONSTRAINT "match_home_team_id_team_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "match" ADD CONSTRAINT "match_away_team_id_team_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "match_groupId_scheduledAt_idx" ON "match" USING btree ("group_id","scheduled_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "match_homeTeamId_idx" ON "match" USING btree ("home_team_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "match_awayTeamId_idx" ON "match" USING btree ("away_team_id");
