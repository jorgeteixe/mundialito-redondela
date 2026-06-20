CREATE TABLE "tournament_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "group_id" uuid;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_group_id_tournament_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."tournament_group"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "team_groupId_idx" ON "team" USING btree ("group_id");